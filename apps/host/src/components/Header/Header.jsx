/**
 * @fileoverview Header Component con selector de repositorio global
 *
 * Usa hooks individuales de Redux para mejor separación de responsabilidades.
 */

import React, { useCallback, useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header as LpHeader, Icons } from '@lp_front_account/lp-kit-dashboards';

import './_header.scss';

// Redux hooks
import {
  useSelectedRepoId,
  useSelectedRepo,
  useReposList,
  useSetSelectedRepo,
} from '@libs/redux';

/**
 * Usuario que vendría de Auth0/contexto, ahorita es simulado
 */
const userMock = {
  name: 'Admin User',
  email: 'admin@liverpool.com',
};

const HeaderComponent = ({ context }) => {
  const navigate = useNavigate();

  // Estado local para UI
  const [openProfileIcon, setOpenProfileIcon] = useState(false);

  // Hooks individuales de Redux
  const selectedRepoId = useSelectedRepoId();
  const selectedRepo = useSelectedRepo();
  const repos = useReposList();
  const setSelectedRepo = useSetSelectedRepo();

  // Inicializar selección si no hay ninguna
  useEffect(() => {
    if (!selectedRepoId && repos.length > 0) {
      setSelectedRepo(repos[0].id);
    }
  }, [selectedRepoId, repos, setSelectedRepo]);

  /**
   * Handler cuando cambia el repo seleccionado
   * Tolerante a diferentes formatos de input del kit:
   * - string (solo id)
   * - objeto { id, name }
   * - evento con target.value
   */
  const handleRepoChange = useCallback(
    (value) => {
      // Extraer id dependiendo del formato
      const id =
        typeof value === 'string' ? value : value?.id || value?.target?.value;

      if (id) {
        console.log('[Header] Repo changed:', id);
        setSelectedRepo(id);
      }
    },
    [setSelectedRepo]
  );

  /**
   * Handler de logout (placeholder)
   */
  const handleLogout = useCallback(() => {
    console.log('[Header] Logout clicked');
    // Implementar lógica de logout
  }, []);

  /**
   * Navegar a una ruta
   */
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <LpHeader
      title="Dashboard de monitoreo"
      headerLogo={
        <Link to="/" className="header-logo-link">
          <Icons
            iconType="HeaderLogo"
            name="Marketplace"
            isWhite
            height="2.5rem"
            width="11.2rem"
            viewBox="0 0 240 60"
          />
        </Link>
      }
      user={userMock}
      // Props de selección de repo (antes stores)
      stores={repos}
      selectedStore={selectedRepo}
      setSelectedStore={handleRepoChange}
      checkStoreIcon={true}
      showStoreIcon={true}
      // Auth
      isAuthenticated={true}
      userStatus="ACTIVE"
      isSimpleHeader={false}
      inactiveOrNotAuthRedirection={() => {}}
      onLogout={handleLogout}
      onLogin={() => {}}
      // Profile
      profileIcon={
        <div className="header-profile-menu">
          <button
            className="header-profile-button"
            onClick={() => {
              setOpenProfileIcon(false);
              handleNavigate('/settings');
            }}
          >
            Configuración
          </button>
          <button className="header-profile-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      }
      openProfileIcon={openProfileIcon}
      setOpenProfileIcon={setOpenProfileIcon}
      // Notificaciones (deshabilitadas por ahora)
      notifications={<div />}
      isNotificationsIcon={false}
      badgeNotification={false}
    />
  );
};

HeaderComponent.displayName = 'HeaderComponent';

export default memo(HeaderComponent);
