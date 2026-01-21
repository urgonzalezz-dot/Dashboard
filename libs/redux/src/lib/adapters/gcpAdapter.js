/**
 * @fileoverview Adapter para GCP (Cloud Run, App Engine, etc.)
 */

import { extractFields, buildUrlFromTemplate } from './extractors.js';
import { normalizeToDeployStatus, normalizeGcpState } from './normalizers.js';
import { createSuccessResult, createErrorResult } from '../types/models.js';

/**
 * Pre-procesa respuesta de GCP antes de extraer campos
 * @param {Object} rawResponse
 * @returns {Object}
 */
const preprocessGcpResponse = (rawResponse) => {
  // GCP puede envolver datos en .status o .data
  const data = rawResponse?.status || rawResponse?.data || rawResponse;

  return {
    ...data,
    // Pre-normalizar estado GCP si existe
    deployState: data?.deployState
      ? normalizeGcpState(data.deployState)
      : data?.status,
  };
};

/**
 * Procesa respuesta completa de GCP
 * @param {Object} rawResponse
 * @param {import('../types/models').RetrieveObject} retrieveObject
 * @returns {import('../types/models').AdapterResult}
 */
export const adaptGcpResponse = (rawResponse, retrieveObject) => {
  try {
    const preprocessed = preprocessGcpResponse(rawResponse);
    const extracted = extractFields(preprocessed, retrieveObject);
    const normalized = normalizeToDeployStatus(extracted);

    return createSuccessResult(normalized);
  } catch (error) {
    return createErrorResult(error.message, rawResponse);
  }
};

/**
 * Construye URL para GCP
 * @param {string} urlTemplate
 * @param {import('../types/models').RepoParams} params
 * @returns {string}
 */
export const buildGcpUrl = (urlTemplate, params) => {
  return buildUrlFromTemplate(urlTemplate, params);
};

/**
 * Construye headers para GCP
 * @param {string} token
 * @returns {Object}
 */
export const buildGcpHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export default {
  adapt: adaptGcpResponse,
  buildUrl: buildGcpUrl,
  buildHeaders: buildGcpHeaders,
};
