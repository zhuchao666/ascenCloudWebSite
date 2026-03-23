'use client';

import styles from './index.module.css';

interface Segment {
  label: string;
  value: number;
  color: string;
}

const segments: Segment[] = [
  { label: 'REIT', value: 25, color: '#8b5cf6' },
  { label: 'Bond', value: 25, color: '#6366f1' },
  { label: 'SU', value: 20, color: '#3b82f6' },
  { label: 'Token', value: 20, color: '#06b6d4' },
  { label: 'Cash', value: 10, color: '#a3a3a3' },
];

const generatePieSlices = (data: Segment[], cx: number, cy: number, r: number) => {
  const paths: { d: string; color: string }[] = [];
  let cumulativeAngle = -90; // 从顶部开始

  data.forEach((segment) => {
    const startAngle = cumulativeAngle;
    const sweepAngle = (segment.value / 100) * 360;
    const endAngle = startAngle + sweepAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    paths.push({ d, color: segment.color });
    cumulativeAngle = endAngle;
  });

  return paths;
};

const PortfolioAllocations = () => {
  const cx = 90;
  const cy = 90;
  const outerR = 85;
  const innerR = 55;
  const slices = generateDonutSlices(segments, cx, cy, outerR, innerR);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Portfolio Allocations</h3>
        <p className={styles.subtitle}>Asset distribution</p>
      </div>

      <div className={styles.chartArea}>
        <div className={styles.donutWrap}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {slices.map((slice, i) => (
              <path key={i} d={slice.d} fill={slice.color} />
            ))}
          </svg>
          <div className={styles.donutCenter}>
            <span className={styles.donutLabel}>Total portfolio</span>
            <span className={styles.donutValue}>$248,532.00</span>
          </div>
        </div>

        <div className={styles.legend}>
          {segments.map((seg) => (
            <div key={seg.label} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: seg.color }} />
              <span className={styles.legendLabel}>{seg.label}</span>
              <span className={styles.legendValue}>{seg.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const generateDonutSlices = (
  data: Segment[],
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
) => {
  const paths: { d: string; color: string }[] = [];
  let cumulativeAngle = -90;

  data.forEach((segment) => {
    const startAngle = cumulativeAngle;
    const sweepAngle = (segment.value / 100) * 360;
    const endAngle = startAngle + sweepAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const outerX1 = cx + outerR * Math.cos(startRad);
    const outerY1 = cy + outerR * Math.sin(startRad);
    const outerX2 = cx + outerR * Math.cos(endRad);
    const outerY2 = cy + outerR * Math.sin(endRad);

    const innerX1 = cx + innerR * Math.cos(endRad);
    const innerY1 = cy + innerR * Math.sin(endRad);
    const innerX2 = cx + innerR * Math.cos(startRad);
    const innerY2 = cy + innerR * Math.sin(startRad);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    const d = [
      `M ${outerX1} ${outerY1}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`,
      `L ${innerX1} ${innerY1}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerX2} ${innerY2}`,
      'Z',
    ].join(' ');

    paths.push({ d, color: segment.color });
    cumulativeAngle = endAngle;
  });

  return paths;
};

export default PortfolioAllocations;
