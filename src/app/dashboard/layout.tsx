'use client';

import styles from './dashboard.module.css';
import DashboardHeader from '@/components/FundDashboard/DashboardHeader';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.dashboardRoot}>
      <DashboardHeader />
      {children}
    </div>
  );
};

export default DashboardLayout;
