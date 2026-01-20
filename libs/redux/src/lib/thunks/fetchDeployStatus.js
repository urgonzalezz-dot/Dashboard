/**
 * @fileoverview Thunk para obtener estado de deployment
 *
 * Flujo:
 * 1. Lee selectedRepoId del estado
 * 2. Obtiene config del appsRegistry
 * 3. Selecciona adapter según source
 * 4. Hace fetch
 * 5. Extrae campos (extractors)
 * 6. Normaliza valores (normalizers)
 * 7. Retorna DeployStatus canónico
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { getRepoConfigById } from '../config/appsRegistry.js';
import { getAdapter } from '../adapters/index.js';
import { selectSelectedRepoId } from '../selectors/repoSelectors.js';

/**
 * Tiempo mínimo entre fetches (ms) - evita refetch innecesario
 */
const CACHE_DURATION_MS = 30000; // 30 segundos

/**
 * Cache de última petición por repoId
 * @type {Map<string, number>}
 */
const lastFetchedAt = new Map();

/**
 * Obtiene token desde variable de entorno
 *
 * tokenEnvKey debe ser el nombre BASE sin prefijo, ej: 'GCP_TOKEN'
 * Se intentan prefijos NX_ y REACT_APP_ automáticamente
 *
 * @param {string} tokenEnvKey - Nombre base de la variable (sin prefijo)
 * @returns {string|null}
 */
const getTokenFromEnv = (tokenEnvKey) => {
  if (!tokenEnvKey) return null;

  // Intentar con diferentes prefijos (NX para monorepo, REACT_APP para CRA)
  return (
    process.env[`NX_${tokenEnvKey}`] ||
    process.env[`REACT_APP_${tokenEnvKey}`] ||
    process.env[tokenEnvKey] || // Sin prefijo como fallback
    null
  );
};

/**
 * Thunk: Fetch deploy status del repo seleccionado
 *
 * Incluye `condition` para evitar refetch si:
 * - Ya hay datos frescos (< CACHE_DURATION_MS)
 * - Ya está loading
 */
export const fetchDeployStatus = createAsyncThunk(
  'repoSelection/fetchDeployStatus',
  async (options = {}, { getState, rejectWithValue }) => {
    const { force = false } = options;

    try {
      const state = getState();
      const selectedRepoId = selectSelectedRepoId(state);

      if (!selectedRepoId) {
        return rejectWithValue('No hay repositorio seleccionado');
      }

      // 1. Obtener config
      const repoConfig = getRepoConfigById(selectedRepoId);
      if (!repoConfig) {
        return rejectWithValue(`Config no encontrada: ${selectedRepoId}`);
      }

      // 2. Obtener adapter
      const adapter = getAdapter(repoConfig.source);

      // 3. Construir URL y headers
      const url = adapter.buildUrl(repoConfig.url, repoConfig.params);
      const token = getTokenFromEnv(repoConfig.params?.tokenEnvKey);
      const headers = adapter.buildHeaders(token);

      console.log(`[fetchDeployStatus] Fetching: ${url}`);

      // 4. Fetch
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();

      // 5. Adaptar (extract + normalize)
      const result = adapter.adapt(rawData, repoConfig.retrieveObject);

      if (!result.success) {
        return rejectWithValue(result.error);
      }

      // 6. Actualizar cache
      lastFetchedAt.set(selectedRepoId, Date.now());

      console.log('[fetchDeployStatus] Result:', result.data);
      return result.data;
    } catch (error) {
      console.error('[fetchDeployStatus] Error:', error);
      return rejectWithValue(error.message);
    }
  },
  {
    /**
     * Condition: decide si ejecutar el thunk
     * Retorna false para cancelar (no ejecutar)
     */
    condition: (options = {}, { getState }) => {
      const { force = false } = options;

      // Si es forzado, siempre ejecutar
      if (force) return true;

      const state = getState();
      const { loading } = state.repoSelection;

      // No ejecutar si ya está loading
      if (loading) {
        console.log('[fetchDeployStatus] Skipped: already loading');
        return false;
      }

      // Verificar cache
      const selectedRepoId = selectSelectedRepoId(state);
      if (selectedRepoId) {
        const lastFetched = lastFetchedAt.get(selectedRepoId);
        if (lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
          console.log('[fetchDeployStatus] Skipped: data is fresh');
          return false;
        }
      }

      return true;
    },
  }
);

export default fetchDeployStatus;
