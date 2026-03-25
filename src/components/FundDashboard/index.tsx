'use client';

import styles from './index.module.css';
import KpiCard from './KpiCard';
import ComplianceCard from './ComplianceCard';
import PortfolioSnapshot from './PortfolioSnapshot';
import PortfolioAllocations from './PortfolioAllocations';
import IncomeSummary from './IncomeSummary';

const kpiData = [
  {
    label: '基金净值',
    value: '¥248,532.00',
    icon: 'portfolio',
  },
  {
    label: '仓位占比',
    value: '85.6%',
    icon: 'pnl',
    progress: 85.6,
  },
  {
    label: '夏普比率',
    value: '1.85',
    icon: 'income',
  },
  {
    label: '最大回撤',
    value: '-12.3%',
    icon: 'dividend',
  },
];

const FundDashboard = () => {
  return (
    <div className={styles.container}>
      {/* KPI Cards Row */}
      <section className={styles.kpiRow}>
        <div className={styles.kpiCards}>
          {kpiData.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
        <ComplianceCard />
      </section>

      {/* 业绩走势 */}
      <section className={styles.incomeRow}>
        <IncomeSummary />
      </section>

      {/* Portfolio Section */}
      <section className={styles.portfolioRow}>
        <PortfolioSnapshot />
        <PortfolioAllocations />
      </section>
    </div>
  );
};

export default FundDashboard;
