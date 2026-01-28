/**
 * @fileoverview Registry y selector de adapters
 */

import gcpAdapter from './gcpAdapter.js';
import githubAdapter from './githubAdapter.js';
import jenkinsAdapter from './jenkinsAdapter.js';
import { extractFields, buildUrlFromTemplate } from './extractors.js';
import { normalizeToDeployStatus } from './normalizers.js';
import {
  DataSourceEnum,
  createSuccessResult,
  createErrorResult,
} from '@libs/models';

/**
 * Registry de adapters por source
 */
const adaptersRegistry = {
  [DataSourceEnum.GCP]: gcpAdapter,
  [DataSourceEnum.GITHUB]: githubAdapter,
  [DataSourceEnum.JENKINS]: jenkinsAdapter,
};

/**
 * Adapter genérico para sources no soportados
 */
export const genericAdapter = {
  adapt: (rawResponse, retrieveObject) => {
    try {
      const extracted = extractFields(rawResponse, retrieveObject);
      const normalized = normalizeToDeployStatus(extracted);
      return createSuccessResult(normalized);
    } catch (error) {
      return createErrorResult(error.message, rawResponse);
    }
  },
  buildUrl: buildUrlFromTemplate,
  buildHeaders: (token) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }),
};

/**
 * Obtiene el adapter correcto para un source
 * @param {import('../types/models').DataSource} source
 * @returns {Object}
 */
export const getAdapter = (source) => {
  return adaptersRegistry[source] || genericAdapter;
};

/**
 * Verifica si un source tiene adapter específico
 * @param {string} source
 * @returns {boolean}
 */
export const hasAdapter = (source) => source in adaptersRegistry;

// Re-exports
export { extractFields, buildUrlFromTemplate } from './extractors.js';
export * from './normalizers.js';

export default {
  getAdapter,
  hasAdapter,
  genericAdapter,
  adaptersRegistry,
};
