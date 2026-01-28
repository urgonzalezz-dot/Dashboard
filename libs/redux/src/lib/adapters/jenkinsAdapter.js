/**
 * @fileoverview Adapter para Jenkins Build API
 */

import { extractFields, buildUrlFromTemplate } from './extractors.js';
import {
  normalizeToDeployStatus,
  normalizeJenkinsState,
} from './normalizers.js';
import {
  createSuccessResult,
  createErrorResult,
  EMPTY_DEPLOY_STATUS,
} from '@libs/models';

/**
 * Pre-procesa respuesta de Jenkins antes de extraer campos
 * @param {Object} rawResponse
 * @returns {Object}
 */
const preprocessJenkinsResponse = (rawResponse) => {
  if (!rawResponse) return null;

  return {
    ...rawResponse,
    // Jenkins: building=true significa en progreso
    // Invertir para 'desplegado': !building = desplegado
    building: !rawResponse.building,
    // Pre-normalizar resultado Jenkins
    result: normalizeJenkinsState(rawResponse.result),
  };
};

/**
 * Procesa respuesta completa de Jenkins
 * @param {Object} rawResponse
 * @param {import('../types/models').RetrieveObject} retrieveObject
 * @returns {import('../types/models').AdapterResult}
 */
export const adaptJenkinsResponse = (rawResponse, retrieveObject) => {
  try {
    const preprocessed = preprocessJenkinsResponse(rawResponse);

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
 * Construye URL para Jenkins
 * @param {string} urlTemplate
 * @param {import('../types/models').RepoParams} params
 * @returns {string}
 */
export const buildJenkinsUrl = (urlTemplate, params) => {
  return buildUrlFromTemplate(urlTemplate, params);
};

/**
 * Construye headers para Jenkins
 * @param {string} token - Token en formato user:apiToken (se hará base64)
 * @returns {Object}
 */
export const buildJenkinsHeaders = (token) => ({
  Authorization: `Basic ${token}`,
  'Content-Type': 'application/json',
});

export default {
  adapt: adaptJenkinsResponse,
  buildUrl: buildJenkinsUrl,
  buildHeaders: buildJenkinsHeaders,
};
