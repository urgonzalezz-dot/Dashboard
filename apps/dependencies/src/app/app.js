// Uncomment this line to use CSS modules
// import styles from './app.module.scss';

import { UpdateCard } from '@libs/ui';

const handleRefresh = () => {
  // / funcion reutilizada
};

export function App() {
  return (
    <UpdateCard
      lastUpdate="02/12/2025 12:00:00 am"
      repository="Entrada única"
      onRefresh={handleRefresh}
    />
  );
}
export default App;
