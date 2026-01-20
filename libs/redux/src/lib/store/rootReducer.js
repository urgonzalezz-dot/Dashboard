/**
 * @fileoverview Root reducer
 */

import { combineReducers } from '@reduxjs/toolkit';
import repoSelectionReducer from '../slices/repoSelectionSlice.js';

/**
 * Root reducer con todos los slices
 */
export const rootReducer = combineReducers({
  repoSelection: repoSelectionReducer,
  // Agregar más slices aquí:
  // auth0: auth0Reducer,
  // gcp: gcpReducer,
  // dependencies: dependenciesReducer,
});

export default rootReducer;
