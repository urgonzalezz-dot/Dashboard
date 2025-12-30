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

## "Ver Detalles" - Funcionalidad Esperada

### Estado Actual (MVP)

Actualmente el botón **"Ver detalles"** muestra una notificación temporal. En la siguiente fase implementaremos un **modal completo** con:

### Secciones del Modal (Próxima Fase)

#### 1. **Header**

```
┌─────────────────────────────────────────┐
│  axios                         Risk: 95  │
│  0.21.1 → 1.6.0                         │
└─────────────────────────────────────────┘
```

#### 2. **Version Gap Breakdown**

```
📊 Análisis de Versiones
─────────────────────────
Current:    0.21.1
Latest:     1.6.0

Gap:        +1 major, +5 minor
Status:     ⚠️ Breaking changes esperados
```

#### 3. **Vulnerabilities** (cuando se integre)

```
 Vulnerabilidades
─────────────────────────
Critical:   2
High:       1
Total:      3

CVE-2021-xxxx: SSRF vulnerability
CVE-2021-yyyy: Improper handling of...
```

#### 4. **Maintenance Info**

```
🔧 Mantenimiento
─────────────────────────
Last publish:   hace 3 meses
Age:            23 meses
Weekly downloads: 15M
```

#### 5. **Tags & Classification**

```
 Categorización
─────────────────────────
Tags:       security, breaking-change, runtime
Type:       Direct dependency (runtime)
Risk Level: Critical
```

#### 6. **Recommended Action**

```
 Acción Recomendada
─────────────────────────
Type:       UPDATE_SECURITY
Priority:   P1 (Urgente)
Action:     Actualizar ahora (fix de seguridad)

Pasos sugeridos:
1. Revisar changelog: npmjs.com/package/axios
2. Revisar breaking changes
3. Actualizar en branch separado
4. Ejecutar tests
5. Merge si pasan tests
```

#### 7. **Links Útiles**

```
🔗 Referencias
─────────────────────────
NPM:        npmjs.com/package/axios
GitHub:     github.com/axios/axios
Changelog:  github.com/axios/axios/releases
```

---

## Elementos Visuales Explicados

### 1. Border Izquierdo con Color

```
┌│─────────────────────────────────┐
││  axios                    Risk:95│  ← Borde rojo (critical)
││  0.21.1 → 1.6.0                 │
└│─────────────────────────────────┘
```

---

### 2. Badge de Risk Score

```
axios                         [Risk: 95]
                               ^^^^^^^^
                               Color de fondo según riskLevel
```

---

### 3. Version Gap

```
0.21.1 → 1.6.0  +1 major
                ^^^^^^^^^
                Breakdown del gap
```

**Breakdown posible:**

- `+1 major` = De 0.x.x a 1.x.x
- `+5 minor` = Dentro del mismo major
- `+3 patch` = Dentro del mismo minor

---

### 4. Tags con Colores

Cada tag tiene color específico (ver sección de Tags arriba).

---

### 5. Recommended Action Row

```
┌──────────────────────────────────────────┐
│    Actualizar ahora (security)    [P1] │
│  ^   ^                              ^    │
│  │   └─ Texto descriptivo           │    │
│  │                                   └─ Prioridad
│  └─ Icono según tipo de acción
└──────────────────────────────────────────┘
```

**Iconos por tipo:**

- = UPDATE_SECURITY
- = REPLACE
- = PLAN_MIGRATION
- = UPDATE_MAJOR
- = UPDATE_SAFE
- = MONITOR
- = REVIEW_MANUAL

---

## Arquitectura de Servicios

### Mapa de Servicios

```
app.js (UI)
    ↓
dependenciesAnalyzer.js (Orquestador principal)
    ↓
    ├─→ buildDependenciesComparison.js (Legacy, obtiene latest versions)
    ├─→ enrichDependencies (Enriquece con análisis)
    │       ↓
    │       ├─→ versionAnalysis.js (Gap de versiones)
    │       ├─→ directDependencyDetector.js (Direct vs transitive)
    │       ├─→ riskScoring.js (Calcula risk score)
    │       ├─→ tagsGenerator.js (Genera tags)
    │       └─→ actionRecommender.js (Acción recomendada)
    └─→ executiveSummaryBuilder.js (Genera resumen ejecutivo)
```

---

### 1. **dependenciesAnalyzer.js** (Orquestador Principal)

**Qué hace:**

- Coordina todo el flujo de análisis
- Aplica memoization automática (evita llamadas duplicadas a NPM)
- Genera metadata (analysisVersion, generatedAt, lockfileHash)
- Retorna estructura completa: { metadata, executiveSummary, dependencies }

**Usado por:** `app.js`

**Funciones principales:**

```javascript
analyzeAllDependencies({
  lockfileJson,
  getLatestVersion,
  getPackageMetadata,
  limit: 50,
  topN: 15,
});
```

---

### 2. **versionAnalysis.js** (Análisis de Versiones)

**Qué hace:**

- Detecta tipo de versión (semver, range, non-semver)
- Calcula version gap (major, minor, patch)
- Maneja pre-releases (alpha, beta, rc)
- Coerce versiones no estándar (v1.2.3 → 1.2.3)

**Usado por:** `buildEnrichedDependencies.js`

**Dónde se usa semver:**

```javascript
import * as semverWrapper from './semverWrapper.js';

// Funciones que usan semver:
-detectVersionType() - // semver.validRange(), semver.valid()
  calculateVersionGap() - // semver.parse()
  isVersionOutdated(); // semver.lt()
```

**Ejemplos:**

```javascript
// Detectar tipo
detectVersionType('^1.2.3')  → 'range'
detectVersionType('1.2.3')   → 'ok'
detectVersionType('file:..') → 'non-semver'

// Calcular gap
calculateVersionGap('1.0.0', '3.5.2')
→ { major: 2, minor: 0, patch: 0, status: 'ok' }
```

---

### 3. **semverWrapper.js** (Wrapper de Semver)

**Qué hace:**

- Wrapper para usar semver en ES modules
- Proporciona funciones async compatibles
- Maneja imports de forma compatible

**Usado por:** `versionAnalysis.js`

**Funciones exportadas:**

```javascript
-valid(version) - // Valida versión
  validRange(range) - // Valida range
  clean(version) - // Limpia versión
  coerce(version) - // Coerce a semver válido
  parse(version) - // Parsea versión
  lt(v1, v2); // Compara (v1 < v2)
```

---

### 4. **directDependencyDetector.js** (Clasificador)

**Qué hace:**

- Extrae dependencias directas de packages[""]
- Clasifica: direct vs transitive
- Clasifica: runtime vs dev
- Fallback a package.json si packages[""] no existe

**Usado por:** `buildEnrichedDependencies.js`

**Funciones:**

```javascript
extractDirectDependencies(lockfileJson, packageJson)
→ { directRuntime: Set, directDev: Set }

classifyDependency(packageName, directRuntime, directDev)
→ { isDirect: boolean, isRuntime: boolean }
```

---

### 5. **riskScoring.js** (Calculadora de Riesgo)

**Qué hace:**

- Calcula risk score (0-110 pts)
- Aplica ponderación por criterio
- Determina risk level (critical/high/medium/low)
- Genera breakdown del score

**Usado por:** `buildEnrichedDependencies.js`

**Función principal:**

```javascript
calculateRiskScore({
  vulnerabilities: null,
  versionGap: { major: 1, minor: 0, patch: 0 },
  isDeprecated: false,
  ageInMonths: 23
})
→ {
  total: 15,
  level: 'medium',
  breakdown: {
    security: 0,
    versionGap: 15,
    deprecated: 0,
    maintenance: 0
  }
}
```

---

### 6. **tagsGenerator.js** (Generador de Tags)

**Qué hace:**

- Genera tags basadas en análisis
- 9 tipos de tags posibles
- No afecta score, solo clasificación visual

**Usado por:** `buildEnrichedDependencies.js`

**Función:**

```javascript
generateTags({
  versionGap,
  isDeprecated,
  isDirect,
  isRuntime,
  isOutdated,
  ageInMonths,
  versionParseStatus
})
→ ['breaking-change', 'runtime']
```

---

### 7. **actionRecommender.js** (Recomendador de Acciones)

**Qué hace:**

- Determina acción recomendada
- Asigna prioridad (1-4)
- Genera texto descriptivo

**Usado por:** `buildEnrichedDependencies.js`

**Función:**

```javascript
getRecommendedAction({
  tags,
  versionGap,
  isDeprecated,
  isOutdated,
  versionParseStatus
})
→ {
  type: 'UPDATE_MAJOR',
  displayText: 'Actualizar major (probar bien)',
  priority: 2
}
```

---

### 8. **buildEnrichedDependencies.js** (Enriquecedor)

**Qué hace:**

- Enriquece lista básica con análisis completo
- Llama a NPM Registry para metadata
- Aplica todos los servicios de análisis
- Maneja errores con degradación elegante

**Usado por:** `dependenciesAnalyzer.js`

**Función:**

```javascript
enrichDependencies({
  basicDependencies,
  lockfileJson,
  getPackageMetadata
})
→ [DependencyAnalysis, ...]
```

---

### 9. **executiveSummaryBuilder.js** (Generador de Resumen)

**Qué hace:**

- Genera riskDistribution (contadores por nivel)
- Calcula stats clave
- Ordena topPriority por priority + riskScore
- Filtra deps accionables (priority 1-3)

**Usado por:** `dependenciesAnalyzer.js`

**Función:**

```javascript
buildExecutiveSummary(enrichedDependencies, topN = 15)
→ {
  riskDistribution: { critical: 0, high: 3, medium: 12, low: 35 },
  stats: { total: 50, deprecated: 1, safeUpdates: 18, ... },
  topPriority: [dep1, dep2, ...] // Top 15 ordenadas
}
```

---

### 10. **memoization.js** (Cache de API Calls)

**Qué hace:**

- Cachea resultados de getLatestVersion y getPackageMetadata
- Evita llamadas duplicadas a NPM Registry
- Reduce latencia en 40-50%
- No cachea errores (reintenta automáticamente)

**Usado por:** `dependenciesAnalyzer.js`

**Función:**

```javascript
createMemoizedAPIs({
  getLatestVersion,
  getPackageMetadata
})
→ {
  getLatestVersion: (memoized),
  getPackageMetadata: (memoized)
}
```

---

### 11. **buildDependenciesComparison.js** (Legacy)

**Qué hace:**

- Obtiene latest version de cada paquete
- Genera lista básica (sin análisis avanzado)
- Mantiene compatibilidad con código antiguo

**Usado por:** `dependenciesAnalyzer.js`

---

## 📊 Uso de Semver en el Sistema

### Archivos que usan semver:

1. **semverWrapper.js**

   - Wrapper principal
   - Todas las funciones semver

2. **versionAnalysis.js**
   - `detectVersionType()`: validRange, valid
   - `calculateVersionGap()`: parse
   - `isVersionOutdated()`: lt (less than)

### Funciones semver utilizadas:

```javascript
// Validación
semver.valid('1.2.3')        → '1.2.3'
semver.validRange('^1.2.3')  → '^1.2.3'

// Coerción
semver.coerce('v1.2.3')      → SemVer { major: 1, minor: 2, patch: 3 }
semver.clean('v1.2.3')       → '1.2.3'

// Parsing
semver.parse('1.2.3')        → SemVer object

// Comparación
semver.lt('1.0.0', '2.0.0')  → true
```

---
