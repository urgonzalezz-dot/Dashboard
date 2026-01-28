/**
 * @fileoverview Normalizadores de valores
 *
 * Normalizaremos los valores obtenidos de las APIs a un modelo general
 */

import {
  DeployStateEnum,
  TRUTHY_DEPLOY_VALUES,
  HEALTHY_STATE_VALUES,
  FAILED_STATE_VALUES,
  DEPLOYING_STATE_VALUES,
  EMPTY_DEPLOY_STATUS,
} from '@libs/models';

/**
 * Normalizar el valor de desplegado a boolean
 * @param {any} value
 * @returns {boolean}
 */

export const normalizeDeployValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return TRUTHY_DEPLOY_VALUES.includes(normalized);
  }
  return false;
};

/**
 * Normaliza cualquier valor al estado canónico
 * @param {any} value - Valor crudo
 * @returns {import('../types/models').DeployState}
 */
export const normalizeStateValue = (value) => {
  if (value === undefined || value === null) return DeployStateEnum.UNKNOWN;

  const normalized = String(value).toLowerCase().trim();

  if (HEALTHY_STATE_VALUES.includes(normalized)) return DeployStateEnum.HEALTHY;
  if (FAILED_STATE_VALUES.includes(normalized)) return DeployStateEnum.FAILED;
  if (DEPLOYING_STATE_VALUES.includes(normalized))
    return DeployStateEnum.DEPLOYING;

  return DeployStateEnum.UNKNOWN;
};

/**
 * Normaliza fecha a ISO string
 * @param {any} value - Timestamp, Date, o string
 * @returns {string|null}
 */
export const normalizeDateValue = (value) => {
  if (!value) return null;

  try {
    // Timestamp en milisegundos
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }

    // Ya es Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // String parseable
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  } catch (e) {
    console.warn('[normalizers] Error parsing date:', e);
  }

  return null;
};

/**
 * Normaliza versión a string
 * @param {any} value
 * @returns {string|null}
 */
export const normalizeVersionValue = (value) => {
  if (!value) return null;
  return String(value).trim();
};

/**
 * Normaliza environment a string
 * @param {any} value
 * @returns {string|null}
 */
export const normalizeEnvironmentValue = (value) => {
  if (!value) return null;
  return String(value).trim().toLowerCase();
};

/**
 * Normaliza un objeto de campos extraídos al DeployStatus canónico
 *
 * @param {Object} extracted - Campos extraídos (sin normalizar)
 * @returns {import('../types/models').DeployStatus}
 */
export const normalizeToDeployStatus = (extracted) => {
  if (!extracted) return { ...EMPTY_DEPLOY_STATUS };

  return {
    desplegado: normalizeDeployValue(extracted.desplegado),
    estado: normalizeStateValue(extracted.estado),
    lastDeployAt: normalizeDateValue(extracted.lastDeployAt),
    version: normalizeVersionValue(extracted.version),
    environment: normalizeEnvironmentValue(extracted.environment),
  };
};

/**
 * Normaliza estado específico de GCP
 * GCP usa: SERVING, STOPPED, etc.
 * @param {string} value
 * @returns {import('../types/models').DeployState}
 */
export const normalizeGcpState = (value) => {
  const gcpMap = {
    serving: DeployStateEnum.HEALTHY,
    running: DeployStateEnum.HEALTHY,
    stopped: DeployStateEnum.FAILED,
    failed: DeployStateEnum.FAILED,
    pending: DeployStateEnum.DEPLOYING,
    starting: DeployStateEnum.DEPLOYING,
  };

  const normalized = String(value || '')
    .toLowerCase()
    .trim();
  return gcpMap[normalized] || normalizeStateValue(value);
};

/**
 * Normaliza estado específico de GitHub
 * GitHub Deployments usa: success, failure, pending, etc.
 * @param {string} value
 * @returns {import('../types/models').DeployState}
 */
export const normalizeGithubState = (value) => {
  const githubMap = {
    success: DeployStateEnum.HEALTHY,
    active: DeployStateEnum.HEALTHY,
    inactive: DeployStateEnum.UNKNOWN,
    failure: DeployStateEnum.FAILED,
    error: DeployStateEnum.FAILED,
    pending: DeployStateEnum.DEPLOYING,
    queued: DeployStateEnum.DEPLOYING,
    in_progress: DeployStateEnum.DEPLOYING,
  };

  const normalized = String(value || '')
    .toLowerCase()
    .trim();
  return githubMap[normalized] || normalizeStateValue(value);
};

/**
 * Normaliza estado específico de Jenkins
 * Jenkins Build usa: SUCCESS, FAILURE, UNSTABLE, ABORTED, null (building)
 * @param {string|null} value
 * @returns {import('../types/models').DeployState}
 */
export const normalizeJenkinsState = (value) => {
  // null en Jenkins significa "en progreso"
  if (value === null) return DeployStateEnum.DEPLOYING;

  const jenkinsMap = {
    success: DeployStateEnum.HEALTHY,
    unstable: DeployStateEnum.HEALTHY, // Pasó pero con warnings
    failure: DeployStateEnum.FAILED,
    aborted: DeployStateEnum.FAILED,
  };

  const normalized = String(value || '')
    .toLowerCase()
    .trim();
  return jenkinsMap[normalized] || normalizeStateValue(value);
};

export default {
  normalizeDeployValue,
  normalizeStateValue,
  normalizeDateValue,
  normalizeVersionValue,
  normalizeEnvironmentValue,
  normalizeToDeployStatus,
  normalizeGcpState,
  normalizeGithubState,
  normalizeJenkinsState,
};
