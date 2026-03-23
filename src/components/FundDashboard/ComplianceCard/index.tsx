'use client';

import styles from './index.module.css';

const ComplianceCard = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <ChartIcon />
        </div>
        <span className={styles.title}>收益对比</span>
      </div>

      <div className={styles.items}>
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>本基金</span>
            <span className={styles.itemDate}>更新于 2026年3月23日</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeUp}`}>+18.56%</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>深沪300</span>
            <span className={styles.itemDate}>更新于 2026年3月23日</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeDown}`}>+6.32%</span>
        </div>
      </div>
    </div>
  );
};

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.5 13.5L10.875 7.875L7.125 11.625L1.5 6"
      stroke="#8200db"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 13.5H16.5V9"
      stroke="#8200db"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ComplianceCard;
