import { useCallback } from 'react';
import { useGetFunctionPublic } from '@libs/hooks';
import { extractMainLockedVersions } from '@libs/utilities';

/**
 * Hook para obtener dependencias del package-lock.json desde GitHub (solo lo utilizamos en ese Mfe)
 *
 * @returns {Object} - { fetchLockfileDependencies, loading, error, clearError }
 */
export const useGithubLockfile = () => {
  const { data, loading, error, getData, clearError } = useGetFunctionPublic();

  /**
   * Obtiene las dependencias del lockfile de un repositorio
   *
   * @param {Object} repoConfig - Configuración del repo desde appsRegistry
   * @param {Object} repoConfig.params - Parámetros del repo
   * @param {string} repoConfig.params.owner - Owner del repo en GitHub
   * @param {string} repoConfig.params.repo - Nombre del repo
   * @param {string} [repoConfig.params.lockfilePath] - Path al package-lock.json (default: 'package-lock.json')
   * @param {string} [repoConfig.params.tokenEnvKey] - Key de la variable de entorno con el token
   * @returns {Promise<{dependencies: Object, devDependencies: Object} | {err: Error}>}
   */
  const fetchLockfileDependencies = useCallback(
    async (repoConfig) => {
      // Extraer parámetros de la config o usar defaults
      const owner = repoConfig?.params?.owner;
      const repo = repoConfig?.params?.repo;
      const lockfilePath = repoConfig?.params?.lockfilePath;
      const token = repoConfig?.params?.tokenEnvKey;
      /* || 'GITHUB_TOKEN'; */

      console.log(repoConfig);

      // Obtener token desde env

      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${lockfilePath}`;

      console.log(
        `[useGithubLockfile] Fetching: ${owner}/${repo}/${lockfilePath}`
      );

      const res = await getData(
        url,
        {},
        { 'X-GitHub-Api-Version': '2022-11-28' },
        token
      );

      if (res?.err) return { err: res.err };

      const base64Content = res?.data?.content;
      if (!base64Content) return { err: new Error('GitHub content is empty') };

      // Decodificar base64
      const decoded = atob(base64Content);
      const lockJson = JSON.parse(decoded);

      const extracted = extractMainLockedVersions(lockJson);
      return extracted; // { dependencies, devDependencies }
    },
    [getData]
  );

  return { data, loading, error, clearError, fetchLockfileDependencies };
};
