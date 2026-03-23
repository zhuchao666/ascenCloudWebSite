'use client';

import styles from './index.module.css';
import KpiCard from './KpiCard';
import ComplianceCard from './ComplianceCard';
import PortfolioSnapshot from './PortfolioSnapshot';
import PortfolioAllocations from './PortfolioAllocations';
import IncomeSummary from './IncomeSummary';

const kpiData = [
  {
    label: 'Total Portfolio',
    value: '$248,532.00',
    change: '+12.5%',
    trend: 'up' as const,
    icon: 'portfolio',
  },
  {
    label: 'Daily P&L',
    value: '$2,845.50',
    change: '+3.2%',
    trend: 'up' as const,
    icon: 'pnl',
  },
  {
    label: 'Total Income',
    value: '$248,532.00',
    change: '+8.1%',
    trend: 'up' as const,
    icon: 'income',
  },
  {
    label: 'Dividend Income',
    value: '$5,680.00',
    change: '+12.5%',
    trend: 'up' as const,
    icon: 'dividend',
  },
];

const FundDashboard = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Fund Dashboard</h1>
          <p className={styles.subtitle}>Track your investments and performance</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportBtn}>
            <ExportIcon />
            Export Report
          </button>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>JD</span>
          </div>
        </div>
      </header>

      {/* KPI Cards Row */}
      <section className={styles.kpiRow}>
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
        <ComplianceCard />
      </section>

      {/* Portfolio Section */}
      <section className={styles.portfolioRow}>
        <PortfolioSnapshot />
        <PortfolioAllocations />
      </section>

      {/* Income Summary */}
      <section className={styles.incomeRow}>
        <IncomeSummary />
      </section>
    </div>
  );
};

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.66667 6.66667L8 10L11.3333 6.66667"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 10V2"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default FundDashboard;
