import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';

import { useHostContext, UpdateCard } from '@libs/ui';
import { Spinner } from '@libs/ui';

// Redux hooks para obtener repo seleccionado
import {
  useSelectedRepoId,
  useSelectedRepo,
  useSelectedRepoConfig,
} from '@libs/redux';

import ExecutiveSummaryCard from '../components/ExecutiveSummaryCard/ExecutiveSummaryCard';
import PrioritySection from '../components/PrioritySection/PrioritySection';
import styles from './app.module.scss';

import { useGithubLockfile } from '../hooks/useGithubLockfile/useGithubLockfile';
import { useNpmRegistry } from '../hooks/useNpmRegistry/useNpmRegistry';
import { analyzeAllDependencies } from '../services/dependenciesAnalyzer';
import { getStatsFromList } from '../services/buildDependenciesComparison';

export function App() {
  const hostContext = useHostContext();
  const isInHost = hostContext?.layout?.isInHost || false;

  // Redux: repo seleccionado globalmente
  const selectedRepoId = useSelectedRepoId();
  const selectedRepo = useSelectedRepo();
  const repoConfig = useSelectedRepoConfig();

  const [dependencies, setDependencies] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('—');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const {
    fetchLockfileDependencies,
    loading: loadingLock,
    error: errorLock,
  } = useGithubLockfile();

  const {
    getLatestVersion,
    getPackageMetadata,
    loading: loadingNpm,
    error: errorNpm,
  } = useNpmRegistry();

  const loading = isAnalyzing || loadingLock || loadingNpm;
  const error = analysisError || errorLock || errorNpm;

  const stats = useMemo(() => getStatsFromList(dependencies), [dependencies]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const repoName = selectedRepo?.name || 'Repositorio';

      if (isInHost)
        hostContext.notifications?.show(
          `Actualizando análisis de ${repoName}...`
        );

      // Pasar config del repo seleccionado al fetch
      const lockfileData = await fetchLockfileDependencies(repoConfig);
      if (lockfileData?.err) throw lockfileData.err;

      const lockfileJson = {
        packages: {
          '': {
            dependencies: lockfileData.dependencies || {},
            devDependencies: lockfileData.devDependencies || {},
          },
          ...(lockfileData.packages || {}),
        },
      };

      const result = await analyzeAllDependencies({
        lockfileJson,
        getLatestVersion,
        getPackageMetadata,
        limit: 50,
        topN: 15,
        repoCommit: null,
      });

      setAnalysisResult(result);
      setDependencies(result.dependencies);

      const now = new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setLastUpdate(now);

      if (isInHost)
        hostContext.notifications?.show(`Análisis de ${repoName} actualizado`);
    } catch (e) {
      console.error('[Dependencies] REFRESH ERROR', e);
      setAnalysisError(e);
      if (isInHost)
        hostContext.notifications?.show('Error al actualizar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    fetchLockfileDependencies,
    getLatestVersion,
    getPackageMetadata,
    isInHost,
    hostContext,
    repoConfig,
    selectedRepo,
  ]);

  // Ref para controlar el fetch inicial
  const didInitialFetch = useRef(false);
  const prevRepoIdRef = useRef(null);

  // Effect: fetch inicial y cuando cambia el repo
  useEffect(() => {
    // Si no hay repo seleccionado, no hacer nada
    if (!selectedRepoId) return;

    // Fetch inicial o cuando cambia el repo
    const isInitialFetch = !didInitialFetch.current;
    const repoChanged = prevRepoIdRef.current !== selectedRepoId;

    if (isInitialFetch || repoChanged) {
      console.log(
        '[Dependencies] Repo changed or initial fetch:',
        selectedRepoId
      );

      // Limpiar estado anterior si cambió el repo
      if (repoChanged && !isInitialFetch) {
        setAnalysisResult(null);
        setDependencies([]);
        setAnalysisError(null);
      }

      didInitialFetch.current = true;
      prevRepoIdRef.current = selectedRepoId;

      handleRefresh();
    }
  }, [selectedRepoId, handleRefresh]);

  const handleDependencyInfo = (dependency) => {
    if (isInHost) {
      hostContext.notifications?.show(
        `Mostrando información de ${dependency.packageName}`
      );
    }
  };

  // Nombre del repo para mostrar en UI
  const repoDisplayName = selectedRepo?.name || 'Sin repositorio';

  const showFullScreenLoader = loading || (!analysisResult && !error);

  if (showFullScreenLoader) {
    return (
      <div className={styles.dependenciesContainer}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dependenciesContainer}>
        <UpdateCard
          lastUpdate={lastUpdate}
          onRefresh={handleRefresh}
          repository={repoDisplayName}
        />

        <div className={styles.errorBox}>
          Error al cargar el análisis: {error?.message || 'Intenta nuevamente'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dependenciesContainer}>
      <UpdateCard
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        repository={repoDisplayName}
      />

      <div className={styles.contentArea}>
        <ExecutiveSummaryCard
          riskDistribution={analysisResult.executiveSummary.riskDistribution}
          stats={analysisResult.executiveSummary.stats}
          metadata={analysisResult.metadata}
        />

        {analysisResult.executiveSummary.topPriority.length > 0 && (
          <PrioritySection
            topPriority={analysisResult.executiveSummary.topPriority}
            onDependencyInfo={handleDependencyInfo}
          />
        )}

        {/* Aquí voy a poner todo lo nuevo que agregue */}
      </div>
    </div>
  );
}

App.displayName = 'DependenciesApp';
export default App;
