import React from 'react';
import { useHostContext } from '@libs/ui';
import App from '../app/app';
import styles from './Dependencies.module.scss';

const Dependencies = () => {
  const hostContext = useHostContext();
  const isInHost = hostContext?.layout?.isInHost || false;

  React.useEffect(() => {
    if (isInHost) {
      console.log('Dependencies MFE cargado dentro del host', {
        user: hostContext.user,
        layout: hostContext.layout,
      });
    }
  }, [isInHost, hostContext]);

  return (
    <div className={styles.dependenciesPage}>
      <App />
    </div>
  );
};

Dependencies.displayName = 'Dependencies';
export default React.memo(Dependencies);
