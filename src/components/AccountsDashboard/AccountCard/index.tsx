'use client';

import styles from './index.module.css';

interface AccountCardProps {
  name: string;
  shortName: string;
  totalAsset: string;
  holdingPnl: string;
  holdingPnlPct: string;
  /** 迷你走势图数据点 (归一化 0~1) */
  sparkData: number[];
  /** 盈亏方向：正 or 负 */
  isPositive: boolean;
}

/**
 * 生成平滑的 SVG 曲线路径 (Catmull-Rom → Cubic Bezier)
 */
const buildSparkPath = (
  data: number[],
  width: number,
  height: number,
  padding = 4,
): string => {
  if (data.length < 2) return '';

  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * plotW,
    y: padding + plotH - v * plotH,
  }));

  const tension = 0.3;
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
};

const SPARK_W = 100;
const SPARK_H = 40;

const AccountCard = ({
  name,
  shortName,
  totalAsset,
  holdingPnl,
  holdingPnlPct,
  sparkData,
  isPositive,
}: AccountCardProps) => {
  const sparkPath = buildSparkPath(sparkData, SPARK_W, SPARK_H);
  // A 股风格：红涨绿跌
  const strokeColor = isPositive ? '#dc2626' : '#16a34a';
  const pnlClass = isPositive ? styles.positive : styles.negative;

  return (
    <div className={styles.card}>
      {/* 头部：图标 + 名称 */}
      <div className={styles.cardHeader}>
        <div className={styles.accountIcon}>{shortName}</div>
        <span className={styles.accountName}>{name}</span>
      </div>

      {/* 中间：总资产 + 迷你曲线 */}
      <div className={styles.cardBody}>
        <div className={styles.assetGroup}>
          <span className={styles.assetLabel}>总资产</span>
          <span className={styles.assetValue}>{totalAsset}</span>
        </div>
        <svg
          className={styles.sparkline}
          width={SPARK_W}
          height={SPARK_H}
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={sparkPath}
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* 底部：总盈亏 */}
      <div className={styles.cardFooter}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>总盈亏</span>
          <span className={`${styles.metricValue} ${pnlClass}`}>
            {holdingPnl}&nbsp;&nbsp;{holdingPnlPct}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
