'use client';

import { useState } from 'react';
import styles from './index.module.css';

interface Segment {
  label: string;
  value: number;
  color: string;
}

const segments: Segment[] = [
  { label: '制造业', value: 32.5, color: '#8b5cf6' },
  { label: '金融业', value: 18.6, color: '#6366f1' },
  { label: '信息技术', value: 15.2, color: '#3b82f6' },
  { label: '其他', value: 33.7, color: '#d1d5db' },
];

// 间隙角度（度），每段之间留出的空白
const GAP_DEG = 2;

// 生成半圆弧段路径（带间隙和圆角），从左到右（180°→0°）
const generateSemiDonutSlices = (
  data: Segment[],
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
) => {
  const totalGap = GAP_DEG * (data.length - 1);
  const availableDeg = 180 - totalGap;
  const paths: { d: string; color: string; midX: number; midY: number }[] = [];
  let cumulativeAngle = 180;

  data.forEach((segment, idx) => {
    const sweepAngle = (segment.value / 100) * availableDeg;
    const startAngle = cumulativeAngle;
    const endAngle = startAngle - sweepAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // 计算弧段中点角度（用于 tooltip 定位）
    const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;
    const midR = (outerR + innerR) / 2;
    const midX = cx + midR * Math.cos(midRad);
    const midY = cy - midR * Math.sin(midRad);

    const outerX1 = cx + outerR * Math.cos(startRad);
    const outerY1 = cy - outerR * Math.sin(startRad);
    const outerX2 = cx + outerR * Math.cos(endRad);
    const outerY2 = cy - outerR * Math.sin(endRad);

    const innerX1 = cx + innerR * Math.cos(endRad);
    const innerY1 = cy - innerR * Math.sin(endRad);
    const innerX2 = cx + innerR * Math.cos(startRad);
    const innerY2 = cy - innerR * Math.sin(startRad);

    const largeArcFlag = sweepAngle > 90 ? 1 : 0;

    const d = [
      `M ${outerX1} ${outerY1}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`,
      `Q ${cx + (outerR - 6) * Math.cos(endRad)} ${cy - (outerR - 6) * Math.sin(endRad)} ${innerX1} ${innerY1}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerX2} ${innerY2}`,
      `Q ${cx + (outerR - 6) * Math.cos(startRad)} ${cy - (outerR - 6) * Math.sin(startRad)} ${outerX1} ${outerY1}`,
      'Z',
    ].join(' ');

    paths.push({ d, color: segment.color, midX, midY });

    // 下一段起始 = 当前结束 - 间隙
    cumulativeAngle = endAngle - (idx < data.length - 1 ? GAP_DEG : 0);
  });

  return paths;
};

// 前三名总占比
const top3Total = segments
  .filter((s) => s.label !== '其他')
  .reduce((sum, s) => sum + s.value, 0);

const PortfolioAllocations = () => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cx = 130;
  const cy = 120;
  const outerR = 110;
  const innerR = 70;
  const slices = generateSemiDonutSlices(segments, cx, cy, outerR, innerR);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top,
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>持仓分布</h3>
        <p className={styles.subtitle}>持仓分布top3</p>
      </div>

      <div className={styles.chartArea}>
        <div className={styles.gaugeWrap}>
          <svg
            width="260"
            height="140"
            viewBox="0 0 260 140"
            className={styles.gaugeSvg}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
          >
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.d}
                fill={slice.color}
                className={styles.slicePath}
                opacity={hoverIdx !== null && hoverIdx !== i ? 0.5 : 1}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            ))}
            <text
              x={cx}
              y={cy - 14}
              textAnchor="middle"
              className={styles.centerLabel}
            >
              Top3总占比
            </text>
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              className={styles.centerValue}
            >
              {top3Total.toFixed(1)}%
            </text>
          </svg>

          {hoverIdx !== null && (
            <div
              className={styles.tooltip}
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 46,
              }}
            >
              <span
                className={styles.tooltipDot}
                style={{ background: segments[hoverIdx].color }}
              />
              <span className={styles.tooltipLabel}>{segments[hoverIdx].label}</span>
              <span className={styles.tooltipValue}>{segments[hoverIdx].value.toFixed(1)}%</span>
            </div>
          )}
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
