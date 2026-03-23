'use client';

import styles from './index.module.css';

const ComplianceCard = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <ShieldIcon />
        </div>
        <span className={styles.title}>Compliance Account</span>
      </div>

      <div className={styles.items}>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <CheckCircleIcon />
            <span className={styles.itemLabel}>KYC</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <AlertCircleIcon />
            <span className={styles.itemLabel}>2FA</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeWarning}`}>Not Verified</span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Verification Progress</span>
          <span className={styles.progressValue}>50%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: '50%' }} />
        </div>
      </div>
    </div>
  );
};

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 16.5C9 16.5 15 13.5 15 9V3.75L9 1.5L3 3.75V9C3 13.5 9 16.5 9 16.5Z"
      stroke="#8200db"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.6667 7.38667V8C14.6659 9.43762 14.2003 10.8365 13.3396 11.9879C12.4789 13.1393 11.2689 13.9817 9.89025 14.3893C8.51163 14.7969 7.03819 14.7479 5.68966 14.2497C4.34113 13.7515 3.18978 12.8307 2.40733 11.6247C1.62489 10.4187 1.25227 8.99205 1.34543 7.55755C1.43859 6.12305 1.99248 4.7575 2.92149 3.66473C3.8505 2.57196 5.10543 1.80919 6.50443 1.48694C7.90343 1.16469 9.37031 1.30008 10.6867 1.87333"
      stroke="#00a63e"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6667 2.66667L8 9.34L6 7.34"
      stroke="#00a63e"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z"
      stroke="#f59e0b"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 5.33333V8" stroke="#f59e0b" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 10.6667H8.00667" stroke="#f59e0b" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ComplianceCard;
