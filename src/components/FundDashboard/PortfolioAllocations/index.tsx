'use client';

import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from './index.module.css';

interface Segment {
  label: string;
  value: number;
  color: string;
}

const segments: Segment[] = [
  { label: '制造业', value: 32.5, color: '#b5a162' },
  { label: '金融业', value: 18.6, color: '#c4b070' },
  { label: '信息技术', value: 15.2, color: '#3b82f6' },
  { label: '其他', value: 33.7, color: '#d1d5db' },
];

// 前三名总占比
const top3Total = segments
  .filter((s) => s.label !== '其他')
  .reduce((sum, s) => sum + s.value, 0);

/**
 * 自定义 Tooltip
 */
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipDot} style={{ background: item.payload.fill }} />
      <span className={styles.tooltipLabel}>{item.name}</span>
      <span className={styles.tooltipValue}>{item.value.toFixed(1)}%</span>
    </div>
  );
};

const PortfolioAllocations = () => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleMouseEnter = useCallback((_: unknown, index: number) => {
    setHoverIdx(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverIdx(null);
  }, []);

  // recharts PieChart 的数据
  const pieData = segments.map((s) => ({
    name: s.label,
    value: s.value,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>持仓分布</h3>
        <p className={styles.subtitle}>持仓分布top3</p>
      </div>

      <div className={styles.chartArea}>
        <div className={styles.gaugeWrap}>
          <PieChart width={260} height={160}>
            <Pie
              data={pieData}
              cx={130}
              cy={130}
              innerRadius={70}
              outerRadius={110}
              startAngle={180}
              endAngle={0}
              paddingAngle={2}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={1}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              animationDuration={600}
            >
              {pieData.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={segments[idx].color}
                  opacity={hoverIdx !== null && hoverIdx !== idx ? 0.5 : 1}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>

          {/* 中心文字 */}
          <div className={styles.centerText}>
            <span className={styles.centerLabel}>Top3总占比</span>
            <span className={styles.centerValue}>{top3Total.toFixed(1)}%</span>
          </div>
        </div>

        <div className={styles.legendList}>
          {segments.map((seg, i) => (
            <div
              key={seg.label}
              className={`${styles.legendCard} ${hoverIdx === i ? styles.legendCardActive : ''}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <div className={styles.legendLeft}>
                <div
                  className={styles.legendDot}
                  style={{ background: seg.color }}
                />
                <span className={styles.legendLabel}>{seg.label}</span>
              </div>
              <span className={styles.legendValue}>
                {seg.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioAllocations;
