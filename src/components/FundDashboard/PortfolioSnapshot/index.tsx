'use client';

import styles from './index.module.css';

interface HoldingRow {
  symbol: string;
  name: string;
  type: string;
  units: string;
  price: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const holdings: HoldingRow[] = [
  {
    symbol: 'VNQ',
    name: 'Vanguard Real Estate',
    type: 'REIT',
    units: '150',
    price: '$89.50',
    value: '$13,425.00',
    change: '+2.4%',
    trend: 'up',
  },
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond',
    type: 'Bond',
    units: '200',
    price: '$72.30',
    value: '$14,460.00',
    change: '-0.8%',
    trend: 'down',
  },
  {
    symbol: 'SU-01',
    name: 'Structured Unit Alpha',
    type: 'SU',
    units: '50',
    price: '$150.00',
    value: '$7,500.00',
    change: '+5.2%',
    trend: 'up',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum Token',
    type: 'Token',
    units: '3.5',
    price: '$1,850.00',
    value: '$6,475.00',
    change: '+12.8%',
    trend: 'up',
  },
  {
    symbol: 'SCHD',
    name: 'Schwab US Dividend',
    type: 'REIT',
    units: '100',
    price: '$75.20',
    value: '$7,520.00',
    change: '+1.5%',
    trend: 'up',
  },
];

const typeColors: Record<string, string> = {
  REIT: '#8b5cf6',
  Bond: '#6366f1',
  SU: '#3b82f6',
  Token: '#06b6d4',
};

const PortfolioSnapshot = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Portfolio Snapshot</h3>
          <p className={styles.subtitle}>Current holdings and performance</p>
        </div>
        <button className={styles.viewAllBtn}>View All</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Asset</th>
              <th className={styles.th}>Type</th>
              <th className={`${styles.th} ${styles.thRight}`}>Units</th>
              <th className={`${styles.th} ${styles.thRight}`}>Price</th>
              <th className={`${styles.th} ${styles.thRight}`}>Value</th>
              <th className={`${styles.th} ${styles.thRight}`}>Change</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((row) => (
              <tr key={row.symbol} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.assetCell}>
                    <div
                      className={styles.assetDot}
                      style={{ background: typeColors[row.type] || '#8b5cf6' }}
                    />
                    <div>
                      <div className={styles.assetSymbol}>{row.symbol}</div>
                      <div className={styles.assetName}>{row.name}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  <span
                    className={styles.typeBadge}
                    style={{
                      color: typeColors[row.type] || '#8b5cf6',
                      background: `${typeColors[row.type] || '#8b5cf6'}14`,
                    }}
                  >
                    {row.type}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.tdRight}`}>{row.units}</td>
                <td className={`${styles.td} ${styles.tdRight}`}>{row.price}</td>
                <td className={`${styles.td} ${styles.tdRight} ${styles.tdBold}`}>{row.value}</td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <span className={row.trend === 'up' ? styles.changeUp : styles.changeDown}>
                    {row.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioSnapshot;
