// NOTA: PASAR TODO A INGLÉS , TRADUCIR

/**
 * @fileoverview Contrato de modelo de estado de despliegue
 *
 * Define interfaces estrictas usando JSDoc para:
 * - Modelo DeployStatus
 * - Configuración de repos (RepoConfig)
 * - Enums de estados
 * - Contratos de adapters
 */

/**
 * Estados canónicos de deployment
 * @typedef {'HEALTHY' | 'FAILED' | 'DEPLOYING' | 'UNKNOWN'} DeployState
 */

/**
 * @type {Object.<string, DeployState>}
 */

// Con freeze para evitar modificaciones en tiempo de ejecución (innmutabilidad)
export const DeployStateEnum = Object.freeze({
  HEALTHY: 'HEALTHY',
  FAILED: 'FAILED',
  DEPLOYING: 'DEPLOYING',
  UNKNOWN: 'UNKNOWN',
});

/**
 * Fuentes de datos soportadas
 * @typedef {'gcp' | 'github' | 'jenkins'} DataSource
 */

/**
 * @type {Object.<string, DataSource>}
 */

export const DataSourceEnum = Object.freeze({
  GCP: 'gcp',
  GITHUB: 'github',
  JENKINS: 'jenkins',
});

/**
 * Modelo para estado de deployment
 * Este es el contrato que los adapters (github, jenkins, gcp) deben producir
 *
 * @typedef {Object} DeployStatus
 * @property {boolean} desplegado - Si la app está desplegada
 * @property {DeployState} estado - Estado normalizado del deployment
 * @property {string|null} lastDeployAt - Fecha ISO del último deploy
 * @property {string|null} version - Versión o SHA del deployment
 * @property {string|null} environment - Ambiente (prod, staging, dev)
 */

/**
 * DeployStatus vacío/default
 * @type {DeployStatus}
 */

// Objeto que se utilizará cuando un deploy esté o inicie vacío
export const EMPTY_DEPLOY_STATUS = Object.freeze({
  desplegado: false,
  estado: DeployStateEnum.UNKNOWN,
  lastDeployAt: null,
  version: null,
  environment: null,
});

/**
 * Mapeo de campos de respuesta para tener un modelo canónico
 * Define que campo dela respuesta cruda corresponde a cada campo ténico
 * @typedef {Object} RetrieveObject
 * @property {string} desplegado - Path al campo que indica si está desplegado
 * @property {string} estado - Path al campo de estado
 * @property {string} [lastDeployAt] - Path al campo de fecha}
 * @property {string} [environment] - Path al campo de ambiente
 */

/**
 * Parámetros de configuración de un repo (para construir la request)
 * @typedef {Object} RepoParams
 * @property {string} [projectId] - ID del proyecto (GCP)
 * @property {string} [owner] - Owner del repo (Github)
 * @property {string} [repo] - Nombre del repo (Github)
 * @property {string} [jobName] - Nombre del job (Jenkins)
 * @property {string} [tokenEnvKey] - Key de la varisble de entorno con el token
 */

/**
 * Configuración de un repositorio / app del team (como consultar y mapear un repositorio)
 * @typedef {Object} RepoConfig
 * @property {string} [id] - ID del repo / app
 * @property {string} [name] - Nombre que se pondrá en la UI
 * @property {string} [DataSource] - Fuente de datos
 * @property {string} url - URL que será el endpoint
 * @property {RetrieveObject} retrieveObject - Para el mapeo de campos
 */

/**
 * Resultado de un adapter después de procesar respuesta
 * @typedef {Object} AdapterResult
 * @property {boolean} success - Si el procesamiento fue exitoso
 * @property {DeployStatus|null} data - Datos normalizados
 * @property {string|null} error - Mensaje de error si falló
 * @property {Object|null} raw - Respuesta para debugging
 */

/**
 * AdapaterResult exitoso
 * @param {DeployStatus} data
 * @returns {AdapterResult}
 */

export const createSuccessResult = (data) => ({
  success: true,
  data,
  error: null,
  raw: null,
});

/**
 * AdapaterResult fallido
 * @param {string} error
 * @param {Object} [raw]
 * @return {AdapaterResult}
 */

export const createErrorResult = (error, raw = null) => ({
  success: false,
  data: null,
  error,
  raw,
});

// ============================================
// ESTADO DEL SLICE
// ============================================

/**
 * Estado de slice de selección del repo para REDUX
 * @typedef {Object} RepoSelectionState
 * @property {string|null} selectedRepoId - ID del repo seleccionado
 * @property {DeployStatus|null} deployStatus - Estado del deployment analizado
 * @property {boolean} loading - Si está cargando datos
 * @property {string|null} error - Mensaje de error si es que existe
 */

// ============================================
// MAPEO PARA NORMALIZAR DATOS
// ============================================

/**
 * Valores que mapean DESPLEGADO : "true" o exitoso
 * @type {ReadonlyArray<string|boolean|number>}
 */

export const TRUTHY_DEPLOY_VALUES = Object.freeze([
  true,
  'true',
  'yes',
  'ok',
  'deployed',
  'active',
  'running',
  1,
  '1',
]);

/**
 * Valores que mapean a HEALTHY
 * @type {ReadonlyArray<string>}
 */
export const HEALTHY_STATE_VALUES = Object.freeze([
  'ok',
  'healthy',
  'running',
  'active',
  'success',
  'succeeded',
  'correct',
  'desplegadobien',
  'available',
  'ready',
]);

/**
 * Valores que mapean a FAILED
 * @type {ReadonlyArray<string>}
 */
export const FAILED_STATE_VALUES = Object.freeze([
  'failed',
  'failure',
  'error',
  'crashed',
  'unhealthy',
  'down',
  'stopped',
  'terminated',
  'aborted',
]);

/**
 * Valores que mapean a DEPLOYING
 * @type {ReadonlyArray<string>}
 */
export const DEPLOYING_STATE_VALUES = Object.freeze([
  'deploying',
  'pending',
  'in_progress',
  'inprogress',
  'building',
  'starting',
  'provisioning',
  'queued',
]);

export default {
  DeployStateEnum,
  DataSourceEnum,
  EMPTY_DEPLOY_STATUS,
  TRUTHY_DEPLOY_VALUES,
  HEALTHY_STATE_VALUES,
  FAILED_STATE_VALUES,
  DEPLOYING_STATE_VALUES,
  createSuccessResult,
  createErrorResult,
};
