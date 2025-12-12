// Uncomment this line to use CSS modules
// import styles from './app.module.scss';
import { UpdateCard } from '@libs/ui';
import { GenericCard } from '@libs/ui';
import UsersIcon from '@mui/icons-material/Person';
import { MixedGraph } from '../components/MixedGraph/MixedGraph';

export function App() {
  const handleRefresh = () => {
    console.log('extrayendo información de las apis');
  };
  // funcion reutilizada

  return (
    <div>
      <UpdateCard
        lastUpdate="02/12/2025 12:00:00 am"
        repository="Entrada única"
        onRefresh={handleRefresh}
      />

      <GenericCard title="Vista General de Ususarios" icon={<UsersIcon />}>
        <MixedGraph />
      </GenericCard>
    </div>
  );
}
export default App;
