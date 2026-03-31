'use client';

import styles from './index.module.css';

interface ProgressBarProps {
  /** 进度百分比值（0-100） */
  value: number;
  /** 轨道高度，默认 6px */
  height?: number;
  /** 自定义外层 className */
  className?: string;
}

const ProgressBar = ({ value, height = 6, className }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`${styles.progressWrap}${className ? ` ${className}` : ''}`}>
      <div className={styles.progressTrack} style={{ height }}>
        <div
          className={styles.progressBar}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
