/**
 * @fileoverview Adapter para GitHub Deployments API
 */

import { extractFields, buildUrlFromTemplate } from './extractors.js';
import {
  normalizeToDeployStatus,
  normalizeGithubState,
} from './normalizers.js';
import {
  createSuccessResult,
  createErrorResult,
  EMPTY_DEPLOY_STATUS,
} from '../types/models.js';

/**
 * Pre-procesa respuesta de GitHub antes de extraer campos
 * GitHub Deployments retorna array, tomamos el más reciente
 * @param {Object|Array} rawResponse
 * @returns {Object}
 */
const preprocessGithubResponse = (rawResponse) => {
  // Si es array, tomar el primer elemento (más reciente)
  const deployment = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse;

  if (!deployment) return null;

  return {
    ...deployment,
    // Pre-normalizar estado GitHub
    state: normalizeGithubState(deployment.state),
    // Derivar 'ok' para el campo desplegado
    ok: deployment.state === 'success' || deployment.state === 'active',
  };
};

/**
 * Procesa respuesta completa de GitHub
 * @param {Object|Array} rawResponse
 * @param {import('../types/models').RetrieveObject} retrieveObject
 * @returns {import('../types/models').AdapterResult}
 */
export const adaptGithubResponse = (rawResponse, retrieveObject) => {
  try {
    const preprocessed = preprocessGithubResponse(rawResponse);

    if (!preprocessed) {
      return createSuccessResult({ ...EMPTY_DEPLOY_STATUS });
    }

    const extracted = extractFields(preprocessed, retrieveObject);
    const normalized = normalizeToDeployStatus(extracted);

    return createSuccessResult(normalized);
  } catch (error) {
    return createErrorResult(error.message, rawResponse);
  }
};

/**
 * Construye URL para GitHub
 * @param {string} urlTemplate
 * @param {import('../types/models').RepoParams} params
 * @returns {string}
 */
export const buildGithubUrl = (urlTemplate, params) => {
  return buildUrlFromTemplate(urlTemplate, params);
};

/**
 * Construye headers para GitHub
 * @param {string} token
 * @returns {Object}
 */
export const buildGithubHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

export default {
  adapt: adaptGithubResponse,
  buildUrl: buildGithubUrl,
  buildHeaders: buildGithubHeaders,
};
