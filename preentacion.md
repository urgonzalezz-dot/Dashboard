# Sistema de Análisis de Dependencias - Guía de Presentación

Documentación completa del sistema de priorización y análisis de dependencias para toma de decisiones técnicas.

---

## Clasificación de Riesgo (Risk Levels)

### ¿Cómo se determina el nivel de riesgo?

Cada dependencia recibe un **Risk Score** (0-110 puntos) basado en 4 criterios ponderados:

| Criterio        | Peso Máximo | Descripción                                                 |
| --------------- | ----------- | ----------------------------------------------------------- |
| **Security**    | 0-40 pts    | Vulnerabilidades conocidas (MVP: 0, se integrará en Fase 3) |
| **Version Gap** | 0-25 pts    | Distancia entre versión actual y latest                     |
| **Deprecated**  | 0-20 pts    | Paquete marcado como obsoleto por el autor                  |
| **Maintenance** | 0-3 pts     | Tiempo sin publicaciones (>24 meses)                        |

### Umbrales de Clasificación

```
Risk Score → Risk Level

80-110 pts → CRITICAL
35-79 pts  → HIGH
15-34 pts  → MEDIUM
0-14 pts   → LOW
```

### Ejemplos

#### CRITICAL (60+ pts)

```javascript
{
  packageName: "old-package",
  currentVersion: "1.0.0",
  latestVersion: "5.0.0",

  riskScore: 63,  // deprecated (20) + major gap ≥2 (25) + >24 meses (3) = 48+
  riskLevel: "critical",

  tags: ["eol-unmaintained", "breaking-change"],
  recommendedAction: "Reemplazar paquete (deprecated)"
}
```

**Por qué CRITICAL:**

- Paquete deprecated por el autor
- 4 major versions de distancia (breaking changes)
- Sin mantenimiento por +2 años

---

#### HIGH (35-59 pts)

```javascript
{
  packageName: "axios",
  currentVersion: "0.21.1",
  latestVersion: "1.6.0",

  riskScore: 40,  // major gap=1 (15) + otros criterios
  riskLevel: "high",

  tags: ["breaking-change", "runtime"],
  recommendedAction: "Actualizar major (probar bien)"
}
```

**Por qué HIGH:**

- 1 major version de distancia (breaking changes)
- Dependencia runtime (afecta producción)
- Requiere testing antes de actualizar

---

#### MEDIUM (15-34 pts)

```javascript
{
  packageName: "lodash",
  currentVersion: "4.17.20",
  latestVersion: "4.17.21",

  riskScore: 8,  // patch gap (5) + otros
  riskLevel: "medium",

  tags: ["minor-update"],
  recommendedAction: "Actualizar ahora (seguro)"
}
```

**Por qué MEDIUM:**

- Solo patch update (sin breaking changes)
- Actualización segura
- Bajo riesgo técnico

---

#### LOW (0-14 pts)

```javascript
{
  packageName: "react",
  currentVersion: "19.0.0",
  latestVersion: "19.0.0",

  riskScore: 0,
  riskLevel: "low",

  tags: ["up-to-date"],
  recommendedAction: "Mantener monitoreado"
}
```

**Por qué LOW:**

- Versión actualizada
- Sin acción necesaria
- Solo monitorear

---

## Separación Runtime vs Dev

### Criterio de Clasificación

El sistema usa `package-lock.json` packages[""] como **source of truth**:

```javascript
// package-lock.json
{
  "packages": {
    "": {
      "dependencies": {
        "react": "^19.0.0",      // ← isDirect: true, isRuntime: true
        "axios": "^1.0.0"        // ← isDirect: true, isRuntime: true
      },
      "devDependencies": {
        "jest": "^30.0.0",       // ← isDirect: true, isRuntime: false
        "@types/node": "^20.0.0" // ← isDirect: true, isRuntime: false
      }
    },
    "node_modules/react": {...},
    "node_modules/follow-redirects": {...}  // ← isDirect: false, isRuntime: null (transitive)
  }
}
```

### Clasificación

| Ubicación                | isDirect | isRuntime | Tag            |
| ------------------------ | -------- | --------- | -------------- |
| `dependencies`           | true     | true      | `runtime`      |
| `devDependencies`        | true     | false     | (ninguno)      |
| Solo en `node_modules/*` | false    | null      | `transitive`   |
| Sin datos                | null     | null      | `unknown-type` |

### ¿Por qué importa?

**Runtime dependencies (producción):**

- Mayor impacto si fallan
- Afectan al usuario final
- Mayor prioridad en actualizaciones de seguridad

**Dev dependencies (desarrollo):**

- Solo afectan al equipo de desarrollo
- Menor urgencia en actualizaciones
- Pueden posponerse si hay limitaciones de tiempo

**Transitive dependencies:**

- Actualizadas automáticamente al actualizar la dependencia directa
- Menor control directo

---

## Significado de Tags y Badges

### Tags Principales

#### security

- **Cuándo aparece:** Vulnerabilidades conocidas (CVE)
- **Impacto en score:** +40 pts (máximo)
- **Acción:** UPDATE_SECURITY (priority 1)
- **Estado MVP:** Campo presente, score=0 (se integrará en Fase 3 con npm audit)

#### breaking-change

- **Cuándo aparece:** Major version gap ≥ 1 (ej: 2.x.x → 3.x.x)
- **Impacto en score:** +15-25 pts
- **Acción:** UPDATE_MAJOR o PLAN_MIGRATION
- **Significado:** Puede romper código existente, requiere testing

#### transitive

- **Cuándo aparece:** No está en dependencies/devDependencies directas
- **Impacto en score:** 0 pts (solo informativo)
- **Significado:** Se actualiza automáticamente con la dependencia padre

#### eol-unmaintained

- **Cuándo aparece:** Paquete deprecated o sin publish >24 meses
- **Impacto en score:** +20 pts (deprecated) o +3 pts (>24 meses)
- **Acción:** REPLACE (buscar alternativa)

#### minor-update

- **Cuándo aparece:** Solo minor/patch disponible (ej: 2.3.4 → 2.8.1)
- **Impacto en score:** +5 pts
- **Acción:** UPDATE_SAFE
- **Significado:** Actualización segura, bajo riesgo

#### up-to-date

- **Cuándo aparece:** currentVersion === latestVersion
- **Impacto en score:** 0 pts
- **Acción:** MONITOR
- **Significado:** Sin acción necesaria

#### runtime

- **Cuándo aparece:** isDirect=true Y isRuntime=true
- **Impacto en score:** 0 pts (solo contexto)
- **Significado:** Dependencia de producción, mayor criticidad

#### non-semver

- **Cuándo aparece:** Versión no parseable (file:, github:, workspace:)
- **Impacto en score:** 0 pts
- **Acción:** REVIEW_MANUAL
- **Ejemplos:** `file:../local-pkg`, `github:user/repo`

#### unknown-type

- **Cuándo aparece:** No se pudo determinar si es direct/transitive
- **Impacto en score:** 0 pts (solo informativo)
- **Recomendación:** Regenerar package-lock.json

---

## Prioridades (P1, P2, P3, P4)

### ¿Qué significa el badge "P3"?

El sistema asigna una **prioridad de acción** (1-4) independiente del Risk Score:

```
P1 (Priority 1) → Urgente
P2 (Priority 2) → Importante
P3 (Priority 3) → Planificable
P4 (Priority 4) → Monitorear
```

### Matriz de Prioridades

| Priority | Acción          | Criterio                    | Ejemplo                        |
| -------- | --------------- | --------------------------- | ------------------------------ |
| **P1**   | UPDATE_SECURITY | Vulnerabilidad de seguridad | CVE detectado                  |
| **P1**   | REPLACE         | Paquete deprecated          | Author marcó como obsoleto     |
| **P2**   | PLAN_MIGRATION  | Major gap ≥ 2               | v1.x.x → v4.x.x                |
| **P2**   | UPDATE_MAJOR    | Major gap = 1               | v2.x.x → v3.x.x                |
| **P3**   | UPDATE_SAFE     | Minor/patch update          | v2.3.4 → v2.8.1                |
| **P3**   | REVIEW_MANUAL   | Non-semver                  | file:, github:, etc.           |
| **P4**   | MONITOR         | Up to date                  | currentVersion = latestVersion |

### ¿Por qué P3 y no P1?

**Ejemplo real:**

```javascript
{
  packageName: "lodash",
  riskScore: 8,           // ← Medium risk
  recommendedAction: {
    type: "UPDATE_SAFE",
    priority: 3,          // ← P3: Seguro pero no urgente
    displayText: "Actualizar ahora (seguro)"
  }
}
```

**Contraste con P1:**

```javascript
{
  packageName: "axios",
  riskScore: 95,
  recommendedAction: {
    type: "UPDATE_SECURITY",
    priority: 1,          // ← P1: Urgente
    displayText: "Actualizar ahora (fix de seguridad)"
  }
}
```

---

