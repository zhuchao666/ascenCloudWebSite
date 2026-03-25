'use client';

import styles from './index.module.css';
import AccountOverview from './AccountOverview';
import AccountCard from './AccountCard';

/** Mock 账户数据 */
const accounts = [
  {
    name: '稳健增长1号',
    shortName: '稳1',
    totalAsset: '¥463,572.00',
    holdingPnl: '+¥32,145.80',
    holdingPnlPct: '+7.46%',
    sparkData: [0.2, 0.25, 0.3, 0.28, 0.35, 0.4, 0.38, 0.45, 0.5, 0.55, 0.6, 0.58, 0.65, 0.7, 0.75],
    isPositive: true,
  },
  {
    name: '价值精选2号',
    shortName: '价2',
    totalAsset: '¥328,910.50',
    holdingPnl: '-¥15,432.60',
    holdingPnlPct: '-4.49%',
    sparkData: [0.7, 0.68, 0.65, 0.6, 0.55, 0.58, 0.52, 0.48, 0.45, 0.42, 0.4, 0.38, 0.35, 0.33, 0.3],
    isPositive: false,
  },
  {
    name: '量化对冲3号',
    shortName: '量3',
    totalAsset: '¥256,780.35',
    holdingPnl: '+¥41,286.50',
    holdingPnlPct: '+19.16%',
    sparkData: [0.1, 0.15, 0.2, 0.25, 0.3, 0.28, 0.35, 0.42, 0.48, 0.55, 0.6, 0.65, 0.72, 0.78, 0.85],
    isPositive: true,
  },
  {
    name: '行业轮动4号',
    shortName: '行4',
    totalAsset: '¥236,367.60',
    holdingPnl: '+¥28,432.48',
    holdingPnlPct: '+13.68%',
    sparkData: [0.3, 0.32, 0.35, 0.4, 0.38, 0.42, 0.48, 0.52, 0.5, 0.55, 0.58, 0.62, 0.6, 0.65, 0.68],
    isPositive: true,
  },
];

const AccountsDashboard = () => {
  return (
    <div className={styles.container}>
      {/* 顶部大盘概览 */}
      <AccountOverview />

      {/* 账户列表标题 */}
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>账户列表</h3>
          <p className={styles.sectionSubtitle}>所有托管账户一览</p>
        </div>
        <span className={styles.accountCount}>共 {accounts.length} 个账户</span>
      </div>

      {/* 账户卡片网格 */}
      <div className={styles.cardGrid}>
        {accounts.map((account) => (
          <AccountCard key={account.name} {...account} />
        ))}
      </div>
    </div>
  );
};

export default AccountsDashboard;
