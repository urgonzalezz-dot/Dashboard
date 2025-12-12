// apps/dashboard/src/app/Module.jsx (ejemplo)
import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '../routes';

export default function Module() {
  const element = useRoutes(routes);
  return (
    <Suspense fallback={<div>Cargando Dashboard...</div>}>{element}</Suspense>
  );
}
