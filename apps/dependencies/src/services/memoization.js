/**
 * @fileoverview Memoization wrapper para API calls (NPM Registry)
 * Evita llamadas duplicadas durante una misma corrida de análisis
 */

/**
 * Crea un wrapper con cache para getLatestVersion
 * Cachea Promises para deduplicar concurrencia.
 *
 * @param {Function} getLatestVersion - Función original
 * @returns {Function} Función con cache
 */
export function memoizeGetLatestVersion(getLatestVersion) {
  const cache = new Map();

  return async function (packageName) {
    if (!packageName) return undefined;

    if (cache.has(packageName)) {
      return await cache.get(packageName);
    }

    const promise = (async () => {
      return await getLatestVersion(packageName);
    })();

    cache.set(packageName, promise);

    try {
      return await promise;
    } catch (err) {
      cache.delete(packageName);
      throw err;
    }
  };
}

/**
 * Crea un wrapper con cache para getPackageMetadata
 * Cachea Promises para deduplicar concurrencia.
 *
 * @param {Function} getPackageMetadata - Función original
 * @returns {Function} Función con cache
 */
export function memoizeGetPackageMetadata(getPackageMetadata) {
  const cache = new Map();

  return async function (packageName) {
    if (!packageName) return undefined;

    if (cache.has(packageName)) {
      return await cache.get(packageName);
    }

    const promise = (async () => {
      return await getPackageMetadata(packageName);
    })();

    cache.set(packageName, promise);

    try {
      return await promise;
    } catch (err) {
      cache.delete(packageName);
      throw err;
    }
  };
}

/**
 * Wrapper conveniente que aplica memoization a ambas funciones
 *
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
