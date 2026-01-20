/**
 * @fileoverview Registro de aplicaciones monitoreadas
 *
 * Estructura dual:
 * - appsById: Objeto indexado por ID O(1) => Modelo propuesto
 * - appsList: Array ordenado
 */

import { DataSourceEnum } from '../types/models.js';

/**
 * Registro indexado por ID
 * @type {Object.<string, import('../types/models.js').RepoConfig>}
 */

export const appsById = {
  libreria: {
    id: 'libreria',
    name: 'Librería App',
    source: DataSourceEnum.GCP,
    url: 'https://api.gcp.example.com/v1/projects/{projectId}/status',
    params: {
      projectId: 'libreria-prod',
      tokenEnvKey: 'GCP_TOKEN',
    },
    retrieveObject: {
      desplegado: 'deploy',
      estado: 'deployState',
      lastDeployAt: 'lastDeploy',
      version: 'currentVersion',
      environment: 'env',
    },
  },

  'front.vendor': {
    id: 'front.vendor',
    name: 'Front Vendor',
    source: DataSourceEnum.GITHUB,
    url: 'https://api.github.com/repos/{owner}/{repo}/deployments',
    params: {
      owner: 'org-name',
      repo: 'front-vendor',
      tokenEnvKey: 'GITHUB_TOKEN1',
    },
    retrieveObject: {
      desplegado: 'ok',
      estado: 'state',
      lastDeployAt: 'updated_at',
      version: 'sha',
      environment: 'environment',
    },
  },

  'cataloging-api': {
    id: 'cataloging-api',
    name: 'Cataloging API',
    source: DataSourceEnum.JENKINS,
    url: 'https://jenkins.example.com/job/{jobName}/lastBuild/api/json',
    params: {
      jobName: 'cataloging-api-deploy',
      tokenEnvKey: 'JENKINS_TOKEN',
    },
    retrieveObject: {
      desplegado: 'building',
      estado: 'result',
      lastDeployAt: 'timestamp',
      version: 'displayName',
      environment: 'description',
    },
  },

  'prueba-api-git': {
    id: 'prueba-api-git',
    name: 'Prueba API',
    source: DataSourceEnum.GITHUB,
    url: 'https://api.github.com/repos/{owner}/{repo}/contents/{lockfilePath}',
    params: {
      owner: 'urgonzalezz-dot',
      repo: 'prueba-api-git',
      lockfilePath: 'Proyecto/package-lock.json',
      tokenEnvKey: 'GITHUB_TOKEN2',
    },
    retrieveObject: {
      desplegado: 'building',
      estado: 'result',
      lastDeployAt: 'timestamp',
      version: 'displayName',
      environment: 'description',
    },
  },

  'app-states': {
    id: 'app-states',
    name: 'App-States',
    source: DataSourceEnum.GITHUB,
    url: 'https://api.github.com/repos/{owner}/{repo}/contents/{lockfilePath}',
    params: {
      owner: 'UliRodGonzZa',
      repo: 'App-States',
      lockfilePath: 'package-lock.json',
      tokenEnvKey: 'GITHUB_TOKEN',
    },
    // Ajusta estos mappings a los campos reales del endpoint de GitHub
    retrieveObject: {
      desplegado: 'building',
      estado: 'result',
      lastDeployAt: 'timestamp',
      version: 'displayName',
      environment: 'description',
    },
  },
};

/**
 * Lista ordenada para UI
 * @type {Array<{id: string, name: string}>}
 */

export const appsList = Object.values(appsById).map(({ id, name }) => ({
  id,
  name,
}));

/**
 * Obtiene configuración de un repo por ID
 * @param {string} repoId
 * @returns {import('../types/models').RepoConfig | undefined}
 */
export const getRepoConfigById = (repoId) => appsById[repoId];

/**
 * Obtiene el source de un repo
 * @param {string} repoId
 * @returns {import('../types/models').DataSource | null}
 */
export const getRepoSourceById = (repoId) => appsById[repoId]?.source || null;

/**
 * Verifica si un repo existe
 * @param {string} repoId
 * @return {boolean}
 */
export const repoExists = (repoId) =>
  Object.prototype.hasOwnProperty.call(appsById, repoId);

/**
 * Obtiene todos los IDs de repos
 * @return {string[]}
 */
export const getAllRepoIds = () => Object.keys(appsById);
