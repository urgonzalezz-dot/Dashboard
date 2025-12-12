import * as React from 'react';
import DashboardHeaderCard from '../../components/DashboardHeader';
import DashboardStatsRow from '../../components/DashboardStatsRow';

const Dashboard = () => {
  return (
    <div style={{ padding: '24px 32px' }}>
      <DashboardHeaderCard />
      <DashboardStatsRow />
    </div>
  );
};

Dashboard.displayName = 'Dashboard';
export default React.memo(Dashboard);
