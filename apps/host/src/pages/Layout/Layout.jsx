/**
 * @fileoverview Layout principal del Host
 */

import * as React from 'react';
import { memo, forwardRef, useRef, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SideMenu } from '@lp_front_account/lp-kit-dashboards';
import { HostContextProvider } from '@libs/ui';

// Redux hooks individuales
import {
  useSelectedRepoId,
  useSelectedRepo,
  useSelectedRepoConfig,
  useReposList,
} from '@libs/redux';

// Components
import HeaderComponent from '../../components/Header/Header';

// Styles
import styles from './_Layout.module.scss';

// Icons MUI
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';

// Memoized Icons
const DashboardIcon = memo(
  forwardRef((props, ref) => (
    <SpaceDashboardOutlinedIcon ref={ref} {...props} />
  ))
);
DashboardIcon.displayName = 'DashboardIcon';

const Auth0Icon = memo(
  forwardRef((props, ref) => <LockOpenOutlinedIcon ref={ref} {...props} />)
);
Auth0Icon.displayName = 'Auth0Icon';

const GcpIcon = memo(
  forwardRef((props, ref) => <CloudOutlinedIcon ref={ref} {...props} />)
);
GcpIcon.displayName = 'GcpIcon';

const DependenciesIcon = memo(
  forwardRef((props, ref) => <ExtensionOutlinedIcon ref={ref} {...props} />)
);
DependenciesIcon.displayName = 'DependenciesIcon';

// Usuario mock
const userMock = { name: 'Jane Doe', email: 'admin@liverpool.com' };

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hooks individuales de Redux
  const selectedRepoId = useSelectedRepoId();
  const selectedRepo = useSelectedRepo();
  const selectedRepoConfig = useSelectedRepoConfig();
  const repos = useReposList();

  // Menú de navegación
  const dataMenu = [
    {
      name: 'Inicio',
      url: '/dashboard',
      menus: [],
      icon: DashboardIcon,
      selectedIcon: DashboardIcon,
    },
    {
      name: 'Auth0',
      url: '/auth0',
      menus: [],
      icon: Auth0Icon,
      selectedIcon: Auth0Icon,
    },
    {
      name: 'GCP',
      url: '/gcp',
      menus: [],
      icon: GcpIcon,
      selectedIcon: GcpIcon,
    },
    {
      name: 'Dependencias',
      url: '/dependencies',
      menus: [],
      icon: DependenciesIcon,
      selectedIcon: DependenciesIcon,
    },
  ];

  const handleGoTo = (url) => navigate(url);

  /**
   * Contexto que se comparte con todos los MFEs
   * Los MFEs pueden acceder al repo seleccionado aquí
   * o directamente desde Redux usando useSelector
   */
  const hostContextValue = {
    layout: {
      headerHeight: '4rem',
      sidebarWidth: 'auto',
      isInHost: true,
    },
    user: userMock,
    isAuthenticated: true,
    navigate: handleGoTo,
    // Repos (antes stores) - ahora derivado de Redux
    repos: {
      available: repos,
      selected: selectedRepo,
      selectedId: selectedRepoId,
      config: selectedRepoConfig,
    },
    // Alias para compatibilidad con código antiguo
    stores: {
      available: repos,
      selected: selectedRepo,
    },
    notifications: {
      show: (message) => {
        console.log('Notification:', message);
      },
    },
  };

  // Variable que nos ayuda a ir al MFE principal cuando hacemos cambio de selección de repo

  const prevRepoIdRef = useRef(null);
  const [sideMenuKey, setSideMenuKey] = useState(0);

  useEffect(() => {
    // Si no tenemos un repo selecciondo simplemente retornamos (aunque siembre habrá uno)
    if (!selectedRepoId) return;

    // Evitar navegación en el primer render
    /*   if (prevRepoIdRef.current === null) {
      prevRepoIdRef.current = selectedRepoId;
      return;
    } */

    const repoChanged = prevRepoIdRef.current !== selectedRepoId;
    if (!repoChanged) return;

    prevRepoIdRef.current = selectedRepoId;

    if (location.pathname !== '/dashboard') {
      handleGoTo('/dashboard');
    }
    setSideMenuKey((k) => k + 1);
  }, [selectedRepoId, location.pathname, handleGoTo]);

  return (
    <HostContextProvider value={hostContextValue}>
      <div className={styles.shell}>
        {/* Header con selector de repo */}
        <div className={styles.header}>
          <HeaderComponent />
        </div>

        {/* Contenedor flex para contenido debajo del header */}
        <div className={styles.mainContainer}>
          {/* SideMenu */}
          <SideMenu
            key={sideMenuKey}
            dataMenu={dataMenu}
            showSideMenu
            routes={location.pathname}
            goTo={handleGoTo}
          />

          {/* Espaciador para el Drawer */}
          <div className={styles.drawerSpacer} />

          {/* Área principal de contenido */}
          <main className={styles.main}>
            <div className={styles.mfeSandbox}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </HostContextProvider>
  );
}
