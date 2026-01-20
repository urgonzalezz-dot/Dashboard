/**
 * @fileoverview Redux slice para selección de repositorio
 *
 * Maneja estado de:
 * - Repo seleccionado
 * - Deploy status
 * - Loading/Error
 *
 * Los selectores derivados están en selectors/repoSelectors.js
 */

import { createSlice } from '@reduxjs/toolkit';
import { fetchDeployStatus } from '../thunks/fetchDeployStatus.js';

/**
 * Estado inicial
 * @type {import('../types/models').RepoSelectionState}
 */
const initialState = {
  selectedRepoId: null,
  deployStatus: null,
  loading: false,
  error: null,
};

const repoSelectionSlice = createSlice({
  name: 'repoSelection',
  initialState,
  reducers: {
    setSelectedRepoId: (state, action) => {
      state.selectedRepoId = action.payload;
      state.deployStatus = null;
      state.error = null;
    },

    clearSelection: (state) => {
      state.selectedRepoId = null;
      state.deployStatus = null;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    setDeployStatus: (state, action) => {
      state.deployStatus = action.payload;
    },

    resetState: () => initialState,
  },

  /**
   * Manejo de acciones asíncronas del thunk
   * El slice importa el thunk, el thunk NO importa el slice
   */
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeployStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeployStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.deployStatus = action.payload;
      })
      .addCase(fetchDeployStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || 'Error desconocido';
      });
  },
});

// Exportar acciones
export const {
  setSelectedRepoId,
  clearSelection,
  clearError,
  setDeployStatus,
  resetState,
} = repoSelectionSlice.actions;

// Exportar reducer
export default repoSelectionSlice.reducer;
