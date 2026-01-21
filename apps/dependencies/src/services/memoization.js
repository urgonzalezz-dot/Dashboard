/**
 * @fileoverview Memoization wrapper para API calls (NPM Registry)
 * Evita llamadas duplicadas durante una misma corrida de análisis
 */

/**
 * Crea un wrapper con cache para getLatestVersion
 * @param {Function} getLatestVersion - Función original
 * @returns {Function} Función con cache
 */
export function memoizeGetLatestVersion(getLatestVersion) {
  const cache = new Map();

  return async function (packageName) {
    if (cache.has(packageName)) {
      return cache.get(packageName);
    }
  };
}

/**
 * Crea un wrapper con cache para getPackageMetadata
 * @param {Function} getPackageMetadata - Función original
 * @returns {Function} Función con cache
 */
export function memoizeGetPackageMetadata(getPackageMetadata) {
  const cache = new Map();

  return async function (packageName) {
    if (cache.has(packageName)) {
      return cache.get(packageName);
    }
  };
}

/**
 * Wrapper conveniente que aplica memoization a ambas funciones
 * @param {Object} params
 * @param {Function} params.getLatestVersion
 * @param {Function} params.getPackageMetadata
 * @returns {Object} Funciones con cache
 */
export function createMemoizedAPIs({ getLatestVersion, getPackageMetadata }) {
  return {
    getLatestVersion: memoizeGetLatestVersion(getLatestVersion),
    getPackageMetadata: memoizeGetPackageMetadata(getPackageMetadata),
  };
}
