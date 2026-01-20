export * from './lib/redux';
export * from './lib/redux.js';
/**
 * @fileoverview Barrel export de @libs/redux
 *
 * Exporta todo lo necesario para usar Redux en la aplicación.
 */

// ============================================
// STORE (factory - SOLO para uso en HOST)
// ============================================
// NOTA: MFEs no deben importar createAppStore, solo usan hooks
export { createAppStore } from './lib/store/createStore.js';
export { rootReducer } from './lib/store/rootReducer.js';

// ============================================
// HOOKS (separados y específicos)
// ============================================
export {
  // Hooks de estado
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
  // Hooks de acciones
  useSetSelectedRepo,
  useSelectRepoAndFetch,
  useRefreshDeployStatus,
  useClearSelection,
  useClearError,
  // Hook combinado
  useRepoSelection,
} from './lib/store/hooks.js';

// ============================================
// SELECTORES
// ============================================
export {
  selectRepoSelectionState,
  selectSelectedRepoId,
  selectSelectedRepo,
  selectSelectedRepoConfig,
  selectSelectedSource,
  selectSelectedRepoName,
  selectDeployStatus,
  selectIsLoading,
  selectError,
  selectIsDesplegado,
  selectDeployState,
  selectHasError,
  selectIsHealthy,
} from './lib/selectors/repoSelectors.js';

// ============================================
// ACCIONES (del slice)
// ============================================
export {
  setSelectedRepoId,
  clearSelection,
  clearError,
  setDeployStatus,
  resetState,
} from './lib/slices/repoSelectionSlice.js';

// ============================================
// THUNKS
// ============================================
export { fetchDeployStatus } from './lib/thunks/fetchDeployStatus.js';

// ============================================
// CONFIG (appsRegistry)
// ============================================
export {
  appsById,
  appsList,
  getRepoConfigById,
  getRepoConfig, // alias
  getRepoSource,
  getReposForSelector, // alias
  repoExists,
  getAllRepoIds,
  appsRegistry, // alias
} from './lib/config/appsRegistry.js';

// ============================================
// ADAPTERS (para uso avanzado)
// ============================================
export {
  getAdapter,
  hasAdapter,
  genericAdapter,
  extractFields,
  buildUrlFromTemplate,
  normalizeDeployValue,
  normalizeStateValue,
  normalizeDateValue,
  normalizeToDeployStatus,
  normalizeGcpState,
  normalizeGithubState,
  normalizeJenkinsState,
} from './lib/adapters/index.js';

// ============================================
// TYPES & CONSTANTS
// ============================================
export {
  DeployStateEnum,
  DataSourceEnum,
  EMPTY_DEPLOY_STATUS,
  TRUTHY_DEPLOY_VALUES,
  HEALTHY_STATE_VALUES,
  FAILED_STATE_VALUES,
  DEPLOYING_STATE_VALUES,
  createSuccessResult,
  createErrorResult,
} from './lib/types/models.js';
