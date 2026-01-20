/**
 * @fileoverview Factory para crear el store
 */

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer.js';

/**
 * Crea una instancia del store
 *
 * @param {Object} [options] - Opciones adicionales
 * @param {Object} [options.preloadedState] - Estado inicial
 * @param {Array} [options.middleware] - Middleware adicional
 * @returns {Object} Store configurado
 */
export const createAppStore = (options = {}) => {
  const { preloadedState, middleware: extraMiddleware = [] } = options;

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => {
      const defaultMiddleware = getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [],
        },
      });

      return defaultMiddleware.concat(extraMiddleware);
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export default createAppStore;
