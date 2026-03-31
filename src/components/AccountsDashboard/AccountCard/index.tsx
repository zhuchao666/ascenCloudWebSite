'use client';

import { LineChart, Line } from 'recharts';
import styles from './index.module.css';

/** 持有人信息 */
interface Holder {
  name: string;
  ratio: number;
  updatedAt: string;
}

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
  /** 是否为集合账户 */
  isGroup?: boolean;
  /** 集合账户的持有人列表 */
  holders?: Holder[];
  /** 点击集合标签的回调 */
  onGroupClick?: () => void;
}

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
  isGroup = false,
  onGroupClick,
}: AccountCardProps) => {
  // A 股风格：红涨绿跌
  const strokeColor = isPositive ? '#dc2626' : '#16a34a';
  const pnlClass = isPositive ? styles.positive : styles.negative;

  // 将归一化数组转为 recharts 数据格式
  const chartData = sparkData.map((v, i) => ({ idx: i, value: v }));

  /** 点击集合卡片 */
  const handleCardClick = () => {
    if (isGroup) {
      onGroupClick?.();
    }
  };

  return (
    <div
      className={`${styles.card} ${isGroup ? styles.cardClickable : ''}`}
      onClick={handleCardClick}
      role={isGroup ? 'button' : undefined}
      tabIndex={isGroup ? 0 : undefined}
      onKeyDown={isGroup ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); } : undefined}
    >
      {/* 头部：图标 + 名称 + 集合标签 */}
      <div className={styles.cardHeader}>
        <div className={styles.accountIcon}>{shortName}</div>
        <span className={styles.accountName}>{name}</span>
        {isGroup && (
          <span className={styles.groupTag}>集合</span>
        )}
      </div>

      {/* 中间：总资产 + 迷你曲线 */}
      <div className={styles.cardBody}>
        <div className={styles.assetGroup}>
          <span className={styles.assetLabel}>总资产</span>
          <span className={styles.assetValue}>{totalAsset}</span>
        </div>
        <LineChart
          width={SPARK_W}
          height={SPARK_H}
          data={chartData}
          className={styles.sparkline}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
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
