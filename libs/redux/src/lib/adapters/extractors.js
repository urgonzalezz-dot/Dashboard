/**
 * @fileoverview Extractores de campos (retrieveObject mapping)
 *
 * Responsabilidad: Extraer valores de respuestas crudas usando paths
 * NO normaliza valores, solo los extrae.
 */

/**
 * Extrae un valor de un objeto usando un path con notación de punto
 * Ej: getValue(obj, 'data.status.state') -> obj.data.status.state
 *
 * @param {Object} obj - Objeto fuente
 * @param {string} path - Path al valor (ej: 'data.status')
 * @returns {any} - Valor extraído o undefined
 */
export const getValueByPath = (obj, path) => {
  if (!obj || !path) return undefined;

  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
};

/**
 * Extrae múltiples campos de un objeto usando retrieveObject
 *
 * @param {Object} rawResponse - Respuesta cruda de API
 * @param {import('../types/models').RetrieveObject} retrieveObject - Mapeo de campos
 * @returns {Object} - Objeto con valores extraídos (sin normalizar)
 */
export const extractFields = (rawResponse, retrieveObject) => {
  if (!rawResponse || !retrieveObject) {
    return {
      desplegado: undefined,
      estado: undefined,
      lastDeployAt: undefined,
      version: undefined,
      environment: undefined,
    };
  }

  return {
    desplegado: getValueByPath(rawResponse, retrieveObject.desplegado),
    estado: getValueByPath(rawResponse, retrieveObject.estado),
    lastDeployAt: getValueByPath(rawResponse, retrieveObject.lastDeployAt),
    version: getValueByPath(rawResponse, retrieveObject.version),
    environment: getValueByPath(rawResponse, retrieveObject.environment),
  };
};

/**
 * Construye URL reemplazando placeholders con params
 *
 * @param {string} urlTemplate - URL con placeholders {param}
 * @param {Object} params - Valores para reemplazar
 * @returns {string}
 */
export const buildUrlFromTemplate = (urlTemplate, params) => {
  if (!urlTemplate) return '';
  if (!params) return urlTemplate;

  let url = urlTemplate;

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      url = url.replace(`{${key}}`, value);
    }
  });

  return url;
};

export default {
  getValueByPath,
  extractFields,
  buildUrlFromTemplate,
};
