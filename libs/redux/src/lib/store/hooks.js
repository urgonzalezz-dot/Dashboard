/**
 * @fileoverview Hooks de Redux
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';

// Gettters
import {
  selectSelectedRepoId,
  selectSelectedRepo,
  selectSelectedRepoConfig,
  selectSelectedSource,
  selectDeployStatus,
  selectIsLoading,
  selectError,
  selectIsHealthy,
  selectDeployState,
} from '../selectors/repoSelectors.js';

// Acciones
import {
  setSelectedRepoId,
  clearSelection,
  clearError,
} from '../slices/repoSelectionSlice.js';

// Thunks
import { fetchDeployStatus } from '../thunks/fetchDeployStatus.js';

// Config
import { appsList } from '../config/appsRegistry.js';

/* 
 HOOKS (GETTERS)
 */

/**
 * Obtiene el ID del repo seleccionado
 * @returns {string|null}
 */

export const useSelectedRepoId = () => {
  return useSelector(selectSelectedRepoId);
};

/**
 * Repo seleccionado como objeto {id, name}
 * @returns {{id: string, name: string}|null}
 */
export const useSelectedRepo = () => {
  return useSelector(selectSelectedRepo);
};

/**
 * Config completa del repo seleccionado
 * @returns {import('../types/models').RepoConfig|null}
 */
export const useSelectedRepoConfig = () => {
  return useSelector(selectSelectedRepoConfig);
};

/**
 * Source del repo seleccionado
 * @returns {import('../types/models').DataSource|null}
 */
export const useSelectedSource = () => {
  return useSelector(selectSelectedSource);
};

/**
 * Deploy status generalizado
 * @returns {import('../types/models').DeployStatus|null}
 */
export const useDeployStatus = () => {
  return useSelector(selectDeployStatus);
};

/**
 * Estado del loading
 * @returns {boolean}
 */
export const useRepoLoading = () => {
  return useSelector(selectIsLoading);
};

/**
 * Error actual
 * @returns {string|null}
 */
export const useRepoError = () => {
  return useSelector(selectError);
};

/**
 * Indica si es repo está saludable o no (true | false)
 * @returns {boolean}
 */
export const useIsHealthy = () => {
  return useSelector(selectIsHealthy);
};

/**
 * Estado de deploy (HEALTHY, FAILED, ...)
 * @returns {import('../types/models').DeployState|null}
 */
export const useDeployState = () => {
  return useSelector(selectDeployState);
};

/**
 * Lista de repos disponibles
 * @returns {Array<{id: string, name: string}>}
 */
export const useReposList = () => {
  return useMemo(() => appsList, []);
};

/* 
HOOKS DE ACCIONES
 */

/**
 * Para cambiar repo seleccionado
 * @returns {(repoId: string) => void}
 */

export const useSetSelectedRepo = () => {
  const dispatch = useDispatch();

  return useCallback(
    (repoId) => {
      dispatch(setSelectedRepoId(repoId));
    },
    [dispatch]
  );
};

/**
 * Seleccionar repo y hacer fetch
 * Combina setSelectedRepoId + fetchDeployStatus
 * @returns {(repoId: string) => Promise<void>}
 */
export const useSelectRepoAndFetch = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (repoId) => {
      dispatch(setSelectedRepoId(repoId));
      // Forzar fetch , sería como quitar el caché
      return dispatch(fetchDeployStatus({ force: true }));
    },
    [dispatch]
  );
};

/**
 * Refrescar deploy status
 * @param {Object} [options]
 * @param {boolean} [options.force=false] - Forzar refetch ignorando cache
 * @returns {(options?: {force?: boolean}) => Promise<void>}
 */
export const useRefreshDeployStatus = () => {
  const dispatch = useDispatch();
  const selectedRepoId = useSelectedRepoId();

  return useCallback(
    (options = {}) => {
      if (selectedRepoId) {
        return dispatch(fetchDeployStatus(options));
      }
      return Promise.resolve();
    },
    [dispatch, selectedRepoId]
  );
};

/**
 * limpiar selección
 * @returns {() => void}
 */
export const useClearSelection = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);
};

/**
 * limpiar error
 * @returns {() => void}
 */
export const useClearError = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
};

/* 
HOOK COMBINADO 
 */

/**
 * Todo el estado de selección de repo
 * @returns {Object}
 */
export const useRepoSelection = () => {
  const selectedRepoId = useSelectedRepoId();
  const selectedRepo = useSelectedRepo();
  const repoConfig = useSelectedRepoConfig();
  const deployStatus = useDeployStatus();
  const loading = useRepoLoading();
  const error = useRepoError();
  const repos = useReposList();

  const setSelectedRepo = useSetSelectedRepo();
  const selectAndFetch = useSelectRepoAndFetch();
  const refresh = useRefreshDeployStatus();
  const clear = useClearSelection();

  return {
    // Estado
    selectedRepoId,
    selectedRepo,
    repoConfig,
    deployStatus,
    loading,
    error,
    repos,

    // Acciones
    setSelectedRepo,
    selectAndFetch,
    refresh,
    clear,
  };
};

export default {
  useSelectedRepoId,
  useSelectedRepo,
  useSelectedRepoConfig,
  useSelectedSource,
  useDeployStatus,
  useRepoLoading,
  useRepoError,
  useIsHealthy,
  useDeployState,
  useReposList,
  useSetSelectedRepo,
  useSelectRepoAndFetch,
  useRefreshDeployStatus,
  useClearSelection,
  useClearError,
  useRepoSelection,
};
