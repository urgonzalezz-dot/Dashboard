/**
 * @fileoverview Contratos y tipos canónicos del sistema de monitoreo
 *
 * Define interfaces estrictas usando JSDoc para:
 * - Modelo canónico DeployStatus
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
export const DeployStateEnum = Object.freeze({
  HEALTHY: 'HEALTHY',
  FAILED: 'FAILED',
  DEPLOYING: 'DEPLOYING',
  UNKNOWN: 'UNKNOWN',
});

/**
 * Fuentes de datos soportadas
 * @typedef {'gcp' | 'github' | 'jenkins' | 'azure' | 'aws'} DataSource
 */

/**
 * @type {Object.<string, DataSource>}
 */
export const DataSourceEnum = Object.freeze({
  GCP: 'gcp',
  GITHUB: 'github',
  JENKINS: 'jenkins',
  AZURE: 'azure',
  AWS: 'aws',
});

/**
 * Modelo canónico para estado de deployment
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
export const EMPTY_DEPLOY_STATUS = Object.freeze({
  desplegado: false,
  estado: DeployStateEnum.UNKNOWN,
  lastDeployAt: null,
  version: null,
  environment: null,
});

/**
 * Mapeo de campos de respuesta al modelo canónico
 * Define qué campo de la respuesta cruda corresponde a cada campo canónico
 *
 * @typedef {Object} RetrieveObject
 * @property {string} desplegado - Path al campo que indica si está desplegado
 * @property {string} estado - Path al campo de estado
 * @property {string} [lastDeployAt] - Path al campo de fecha
 * @property {string} [version] - Path al campo de versión
 * @property {string} [environment] - Path al campo de ambiente
 */

/**
 * Parámetros de configuración de un repo
 * @typedef {Object} RepoParams
 * @property {string} [projectId] - ID del proyecto (GCP)
 * @property {string} [owner] - Owner del repo (GitHub)
 * @property {string} [repo] - Nombre del repo (GitHub)
 * @property {string} [lockfilePath] - Path al package-lock.json
 * @property {string} [jobName] - Nombre del job (Jenkins)
 * @property {string} [tokenEnvKey] - Key de la variable de entorno con el token
 */

/**
 * Configuración completa de un repositorio/app
 *
 * @typedef {Object} RepoConfig
 * @property {string} id - Identificador único del repo/app
 * @property {string} name - Nombre legible para UI
 * @property {DataSource} source - Fuente de datos
 * @property {string} url - URL template del endpoint
 * @property {RepoParams} params - Parámetros para la petición
 * @property {RetrieveObject} retrieveObject - Mapeo de campos
 */

/**
 * Resultado de un adapter después de procesar respuesta
 * @typedef {Object} AdapterResult
 * @property {boolean} success - Si el procesamiento fue exitoso
 * @property {DeployStatus|null} data - Datos normalizados
 * @property {string|null} error - Mensaje de error si falló
 * @property {Object|null} raw - Respuesta original
 */

/**
 * Estado del slice de selección de repositorio
 * @typedef {Object} RepoSelectionState
 * @property {string|null} selectedRepoId - ID del repo seleccionado
 * @property {DeployStatus|null} deployStatus - Estado de deployment actual
 * @property {boolean} loading - Si está cargando datos
 * @property {string|null} error - Mensaje de error si existe
 */

/**
 * AdapterResult exitoso
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
 * AdapterResult fallido
 * @param {string} error
 * @param {Object} [raw]
 * @returns {AdapterResult}
 */
export const createErrorResult = (error, raw = null) => ({
  success: false,
  data: null,
  error,
  raw,
});

/**
 * Valores que representan desplegado: true
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
 * Valores crudos que mapean a FAILED
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
 * Valores crudos que mapean a DEPLOYING
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
