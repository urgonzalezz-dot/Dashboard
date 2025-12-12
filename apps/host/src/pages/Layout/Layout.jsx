// apps/host/src/pages/Layout/Layout.jsx
import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header, Icons, SideMenu } from '@lp_front_account/lp-kit-dashboards';
import { useState, memo, forwardRef } from 'react';
import styles from './_Layout.module.scss';

// Icons MUI
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';

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

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userMock = { name: 'Jane Doe', email: 'admin@liverpool.com' };
  const storesMock = [
    { id: 1, name: 'México, CDMX' },
    { id: 2, name: 'Guadalajara, JAL' },
  ];
  const [selectedStore, setSelectedStore] = useState(storesMock[0]);

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

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <Header
          title="Dashboard de monitoreo"
          headerLogo={
            <a href="/">
              <Icons
                iconType="HeaderLogo"
                name="Marketplace"
                isWhite
                height="2.5rem"
                width="11.2rem"
                viewBox="0 0 240 60"
              />
            </a>
          }
          user={userMock}
          stores={storesMock}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          checkStoreIcon={true}
          showStoreIcon={true}
          isAuthenticated={true}
          userStatus="ACTIVE"
          isSimpleHeader={false}
          inactiveOrNotAuthRedirection={() => {}}
          onLogout={() => {}}
          onLogin={() => {}}
          profileIcon={<div />}
          openProfileIcon={false}
          setOpenProfileIcon={() => {}}
          notifications={<div />}
          isNotificationsIcon={true}
          badgeNotification={false}
        />
      </div>

      <aside className={styles.side}>
        <SideMenu
          dataMenu={dataMenu}
          showSideMenu
          routes={location.pathname}
          goTo={handleGoTo}
        />
      </aside>

      <main className={styles.main}>
        <div className={styles.mfeSandbox}>
          {/* Aquí “vive” el MFE (o páginas internas del host) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
