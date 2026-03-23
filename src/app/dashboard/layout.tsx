'use client';

import styles from './dashboard.module.css';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.dashboardRoot}>{children}</div>;
};

export default DashboardLayout;
