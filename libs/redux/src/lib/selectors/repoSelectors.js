/**
 * @fileoverview Selectores de estado
 */

import { appsById } from '../config/appsRegistry.js';

/**
 * Registro indexado por ID
 * @type {Object.<string, import('@libs/models').RepoConfig>}
 */

/**
 * Selector base: obtiene el sub-estado repoSelection
 * @param {Object} state - Estado global de Redux
 * @returns {import('@libs/models').RepoSelectionState}
 */
export const selectRepoSelectionState = (state) => state.repoSelection;

/* state = {
  repoSelection: {
    selectedRepoId,
    deployStatus,
    loading,
    error,
  }
}; */

/**
 * Selector: ID del repo seleccionado
 * @param {Object} state
 * @returns {string|null}
 */

export const selectSelectedRepoId = (state) =>
  state.repoSelection?.selectedRepoId ?? null;

/**
 * Selector: Estado de deployment
 * @param {Object} state
 * @returns {import('@libs/models').DeployStatus|null}
 */
export const selectDeployStatus = (state) =>
  state.repoSelection?.deployStatus ?? null;

/**
 * Selector: Estado de loading
 * @param {Object} state
 * @returns {boolean}
 */
export const selectIsLoading = (state) => state.repoSelection?.loading ?? false;

/**
 * Selector: Error actual
 * @param {Object} state
 * @returns {string|null}
 */
export const selectError = (state) => state.repoSelection?.error ?? null;

/**
 * Selector derivado: Configuración completa del repo seleccionado
 * @param {Object} state
 * @returns {import('@libs/models').RepoConfig|null}
 */

export const selectSelectedRepoConfig = (state) => {
  const repoId = selectSelectedRepoId(state);
  if (!repoId) return null; // solo en este primer
  return appsById[repoId] ?? null;
};

/**
 * Selector derivado: Source del repo seleccionado
 * @param {Object} state
 * @returns {import('@libs/models').DataSource|null}
 */

export const selectSelectedSource = (state) => {
  const config = selectSelectedRepoConfig(state);
  return config?.source ?? null;
};

/**
 * Selector derivado: Nombre del repo seleccionado
 * @param {Object} state
 * @returns {string|null}
 */
export const selectSelectedRepoName = (state) => {
  const config = selectSelectedRepoConfig(state);
  return config?.name ?? null;
};

/**
 * Selector derivado: Repo seleccionado como objeto {id, name} UI
 * @param {Object} state
 * @returns {{id: string, name: string}|null}
 */
export const selectSelectedRepo = (state) => {
  const config = selectSelectedRepoConfig(state);
  if (!config) return null;
  return { id: config.id, name: config.name };
};

/**
 * Selector derivado: Nos indica si está desplegado o no
 * @param {Object} state
 * @returns {boolean}
 */
export const selectIsDesplegado = (state) => {
  const status = selectDeployStatus(state);
  return status?.desplegado ?? false;
};

/**
 * Selector derivado: Estado de deployment
 * @param {Object} state
 * @returns {import('@libs/models').DeployState|null}
 */
export const selectDeployState = (state) => {
  const status = selectDeployStatus(state);
  return status?.estado ?? null;
};

/**
 * Selector derivado: Si existe algún error (true | false )
 * @param {Object} state
 * @returns {boolean}
 */

export const selectHasError = (state) => selectError(state) !== null;

/**
 * Selector derivado: Si está en estado saludable o no (true | false)
 * @param {Object} state
 * @returns {boolean}
 */

export const selectIsHealthy = (state) => {
  const status = selectDeployStatus(state);
  return status?.estado === 'HEALTHY';
};

export default {
  selectRepoSelectionState,
  selectSelectedRepoId,
  selectDeployStatus,
  selectIsLoading,
  selectError,
  selectSelectedRepoConfig,
  selectSelectedSource,
  selectSelectedRepoName,
  selectSelectedRepo,
  selectIsDesplegado,
  selectDeployState,
  selectHasError,
  selectIsHealthy,
};
