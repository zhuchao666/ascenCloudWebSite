'use client';

import { useState } from 'react';
import styles from './index.module.css';

interface DataPoint {
  month: string;
  value: number;
}

const chartData: DataPoint[] = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 18000 },
  { month: 'Mar', value: 22449 },
  { month: 'Apr', value: 16000 },
  { month: 'May', value: 28000 },
  { month: 'Jun', value: 24000 },
];

const IncomeSummary = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartW = 800;
  const chartH = 220;
  const paddingX = 50;
  const paddingY = 20;
  const plotW = chartW - paddingX * 2;
  const plotH = chartH - paddingY * 2;

  const maxVal = 32000;
  const yTicks = [0, 8000, 16000, 24000, 32000];

  const getX = (i: number) => paddingX + (i / (chartData.length - 1)) * plotW;
  const getY = (val: number) => paddingY + plotH - (val / maxVal) * plotH;

  // 生成折线路径
  const linePath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  // 生成渐变面积路径
  const areaPath = `${linePath} L ${getX(chartData.length - 1)} ${chartH - paddingY} L ${paddingX} ${chartH - paddingY} Z`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Income Summary</h3>
          <p className={styles.subtitle}>Monthly income overview</p>
        </div>
        <div className={styles.periodTabs}>
          <button className={`${styles.tab} ${styles.tabActive}`}>6M</button>
          <button className={styles.tab}>1Y</button>
          <button className={styles.tab}>All</button>
        </div>
      </div>

      <div className={styles.chartWrap}>
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className={styles.chart}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9810fa" />
              <stop offset="100%" stopColor="#155dfc" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={paddingX}
              y1={getY(tick)}
              x2={chartW - paddingX}
              y2={getY(tick)}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
            />
          ))}

          {/* Y axis labels */}
          {yTicks.map((tick) => (
            <text
              key={`y-${tick}`}
              x={paddingX - 8}
              y={getY(tick) + 4}
              textAnchor="end"
              className={styles.axisLabel}
            >
              {tick === 0 ? '0' : `${tick / 1000}k`}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={d.month}>
              {/* Hit area for hover */}
              <rect
                x={getX(i) - 30}
                y={0}
                width={60}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              />

              {/* Dot */}
              <circle
                cx={getX(i)}
                cy={getY(d.value)}
                r={hoveredIndex === i ? 5 : 3.5}
                fill="#ffffff"
                stroke="url(#lineGradient)"
                strokeWidth="2"
              />

              {/* Hover line */}
              {hoveredIndex === i && (
                <line
                  x1={getX(i)}
                  y1={getY(d.value) + 8}
                  x2={getX(i)}
                  y2={chartH - paddingY}
                  stroke="#8b5cf6"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.4"
                />
              )}

              {/* X axis labels */}
              <text
                x={getX(i)}
                y={chartH - 2}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {d.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div
            className={styles.tooltip}
            style={{
              left: `${(getX(hoveredIndex) / chartW) * 100}%`,
              top: `${(getY(chartData[hoveredIndex].value) / chartH) * 100 - 14}%`,
            }}
          >
            <div className={styles.tooltipDate}>
              {chartData[hoveredIndex].month} 02, 2025
            </div>
            <div className={styles.tooltipValue}>
              ${chartData[hoveredIndex].value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeSummary;
