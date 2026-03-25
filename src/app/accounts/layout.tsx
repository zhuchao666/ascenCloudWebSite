'use client';

import styles from '../dashboard/dashboard.module.css';
import DashboardHeader from '@/components/FundDashboard/DashboardHeader';

const AccountsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.dashboardRoot}>
      <DashboardHeader />
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
};

export default AccountsLayout;
