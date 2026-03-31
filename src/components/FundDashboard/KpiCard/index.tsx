'use client';

import styles from './index.module.css';
import ProgressBar from '../../ProgressBar';

interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  progress?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  portfolio: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 8.33333V3.33333H12.5" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 3.33333L11.25 9.58333C11.0947 9.73809 10.8842 9.82485 10.6646 9.82485C10.445 9.82485 10.2345 9.73809 10.0792 9.58333L7.91667 7.41667C7.76138 7.2619 7.55092 7.17514 7.33133 7.17514C7.11175 7.17514 6.90128 7.2619 6.746 7.41667L2.5 11.6667" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 16.6667H17.5" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pnl: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3L10 10M14 3L10 10M10 10V17" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 12.5H13.5" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 15H13.5" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  income: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07953 2.5 5V15C2.5 15.9205 3.24619 16.6667 4.16667 16.6667H15.8333C16.7538 16.6667 17.5 15.9205 17.5 15V5C17.5 4.07953 16.7538 3.33333 15.8333 3.33333Z" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 8.33333H17.5" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66667 13.3333H6.675" stroke="#9a8745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13.3333H10.0083" stroke="#9a8745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dividend: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 5V10L13.3333 11.6667" stroke="#9a8745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const KpiCard = ({ label, value, icon, progress }: KpiCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.iconWrap}>{iconMap[icon]}</div>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {progress !== undefined && (
        <ProgressBar value={progress} className={styles.progressWrap} />
      )}
    </div>
  );
};


export default KpiCard;
