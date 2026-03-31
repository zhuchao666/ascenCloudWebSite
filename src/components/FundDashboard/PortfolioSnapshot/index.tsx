'use client';

import Table from 'rc-table';
import type { ColumnsType } from 'rc-table/lib/interface';
import 'rc-table/assets/index.css';
import styles from './index.module.css';

interface HoldingRow {
  sector: string;
  ratio: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

const holdings: HoldingRow[] = [
  { sector: '制造业', ratio: '32.5%', change: '+2.4%', trend: 'up', color: '#b5a162' },
  { sector: '金融业', ratio: '18.6%', change: '-0.8%', trend: 'down', color: '#c4b070' },
  { sector: '信息技术', ratio: '15.2%', change: '+5.2%', trend: 'up', color: '#3b82f6' },
  { sector: '医药生物', ratio: '12.8%', change: '+1.5%', trend: 'up', color: '#06b6d4' },
  { sector: '新能源', ratio: '10.3%', change: '+3.1%', trend: 'up', color: '#10b981' },
  { sector: '消费', ratio: '6.4%', change: '-1.2%', trend: 'down', color: '#f59e0b' },
  { sector: '其他', ratio: '4.2%', change: '+0.3%', trend: 'up', color: '#9ca3af' },
];

const columns: ColumnsType<HoldingRow> = [
  {
    title: '板块名称',
    dataIndex: 'sector',
    key: 'sector',
    render: (_: string, record: HoldingRow) => (
      <div className={styles.assetCell}>
        <div
          className={styles.assetDot}
          style={{ background: record.color }}
        />
        <span className={styles.assetSymbol}>{record.sector}</span>
      </div>
    ),
  },
  {
    title: '持仓占比',
    dataIndex: 'ratio',
    key: 'ratio',
    align: 'right' as const,
    render: (value: string) => (
      <span className={styles.tdBold}>{value}</span>
    ),
  },
  {
    title: '较上次披露变化',
    dataIndex: 'change',
    key: 'change',
    align: 'right' as const,
    render: (_: string, record: HoldingRow) => (
      <span className={record.trend === 'up' ? styles.changeUp : styles.changeDown}>
        {record.change}
      </span>
    ),
  },
];

const PortfolioSnapshot = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>基金持仓</h3>
          <p className={styles.subtitle}>当前基金持仓板块分布 <span className={styles.updateTime}>· 更新于 2026年3月23日</span></p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <Table
          className={styles.table}
          columns={columns}
          data={holdings}
          rowKey="sector"
        />
      </div>
    </div>
  );
};

export default PortfolioSnapshot;
