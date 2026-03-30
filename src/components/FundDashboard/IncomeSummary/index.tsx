'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './index.module.css';

interface DataPoint {
  date: string;
  value: number;
}

interface PeriodDataSet {
  fund: DataPoint[];
  hs300: DataPoint[];
  sz: DataPoint[];
}

// ── 近3月 mock 数据 ──
const period3m: PeriodDataSet = {
  fund: [
    { date: '2026-01-07', value: 2.1 },
    { date: '2026-01-21', value: 3.8 },
    { date: '2026-02-04', value: 3.1 },
    { date: '2026-02-18', value: 5.4 },
    { date: '2026-03-04', value: 4.6 },
    { date: '2026-03-18', value: 6.2 },
  ],
  hs300: [
    { date: '2026-01-07', value: 1.0 },
    { date: '2026-01-21', value: 2.2 },
    { date: '2026-02-04', value: 1.8 },
    { date: '2026-02-18', value: 3.1 },
    { date: '2026-03-04', value: 2.9 },
    { date: '2026-03-18', value: 3.8 },
  ],
  sz: [
    { date: '2026-01-07', value: 0.6 },
    { date: '2026-01-21', value: 1.5 },
    { date: '2026-02-04', value: 1.2 },
    { date: '2026-02-18', value: 2.4 },
    { date: '2026-03-04', value: 2.0 },
    { date: '2026-03-18', value: 3.0 },
  ],
};

// ── 近6月 mock 数据 ──
const period6m: PeriodDataSet = {
  fund: [
    { date: '2025-10-15', value: 1.2 },
    { date: '2025-11-15', value: 3.5 },
    { date: '2025-12-15', value: 5.8 },
    { date: '2026-01-15', value: 3.2 },
    { date: '2026-02-15', value: 7.6 },
    { date: '2026-03-15', value: 6.1 },
  ],
  hs300: [
    { date: '2025-10-15', value: 0.8 },
    { date: '2025-11-15', value: 2.1 },
    { date: '2025-12-15', value: 3.4 },
    { date: '2026-01-15', value: 2.5 },
    { date: '2026-02-15', value: 4.8 },
    { date: '2026-03-15', value: 4.2 },
  ],
  sz: [
    { date: '2025-10-15', value: 0.5 },
    { date: '2025-11-15', value: 1.8 },
    { date: '2025-12-15', value: 2.9 },
    { date: '2026-01-15', value: 1.6 },
    { date: '2026-02-15', value: 3.9 },
    { date: '2026-03-15', value: 3.3 },
  ],
};

// ── 近1年 mock 数据 ──
const period1y: PeriodDataSet = {
  fund: [
    { date: '2025-05-15', value: 0.8 },
    { date: '2025-07-15', value: 4.2 },
    { date: '2025-09-15', value: 6.5 },
    { date: '2025-11-15', value: 5.1 },
    { date: '2026-01-15', value: 9.8 },
    { date: '2026-03-15', value: 12.3 },
  ],
  hs300: [
    { date: '2025-05-15', value: 0.4 },
    { date: '2025-07-15', value: 2.6 },
    { date: '2025-09-15', value: 3.8 },
    { date: '2025-11-15', value: 3.2 },
    { date: '2026-01-15', value: 5.6 },
    { date: '2026-03-15', value: 6.3 },
  ],
  sz: [
    { date: '2025-05-15', value: 0.2 },
    { date: '2025-07-15', value: 1.9 },
    { date: '2025-09-15', value: 3.1 },
    { date: '2025-11-15', value: 2.4 },
    { date: '2026-01-15', value: 4.5 },
    { date: '2026-03-15', value: 5.1 },
  ],
};

// ── 成立来 mock 数据 ──
const periodAll: PeriodDataSet = {
  fund: [
    { date: '2023-06-01', value: 0.0 },
    { date: '2023-12-01', value: 5.6 },
    { date: '2024-06-01', value: 8.2 },
    { date: '2024-12-01', value: 6.4 },
    { date: '2025-06-01', value: 14.5 },
    { date: '2026-03-15', value: 18.6 },
  ],
  hs300: [
    { date: '2023-06-01', value: 0.0 },
    { date: '2023-12-01', value: 3.2 },
    { date: '2024-06-01', value: 4.8 },
    { date: '2024-12-01', value: 3.5 },
    { date: '2025-06-01', value: 7.2 },
    { date: '2026-03-15', value: 6.3 },
  ],
  sz: [
    { date: '2023-06-01', value: 0.0 },
    { date: '2023-12-01', value: 2.5 },
    { date: '2024-06-01', value: 3.9 },
    { date: '2024-12-01', value: 2.8 },
    { date: '2025-06-01', value: 5.8 },
    { date: '2026-03-15', value: 5.1 },
  ],
};

const periodDataMap: Record<string, PeriodDataSet> = {
  '近3月': period3m,
  '近6月': period6m,
  '近1年': period1y,
  '成立来': periodAll,
};

const periods = ['近3月', '近6月', '近1年', '成立来'] as const;

const legendItems = [
  { label: '本基金', color: '#b5a162' },
  { label: '沪深300', color: '#f59e0b' },
  { label: '上证指数', color: '#10b981' },
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * 自定义 Tooltip
 */
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipDate}>{label}</div>
      {payload.map((item) => (
        <div key={item.name} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: item.color }} />
          <span className={styles.tooltipLabel}>{item.name}</span>
          <span className={styles.tooltipVal}>{item.value.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
};

const IncomeSummary = () => {
  const [activePeriod, setActivePeriod] = useState<string>('近6月');
  const [sliderStyle, setSliderStyle] = useState<{ transform: string; width: string }>({
    transform: 'translateX(0px)',
    width: '0px',
  });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentDataSet = periodDataMap[activePeriod];

  // 合并三条线的数据为 recharts 需要的单一数组
  const chartData = currentDataSet.fund.map((item, i) => ({
    date: formatDate(item.date),
    '本基金': item.value,
    '沪深300': currentDataSet.hs300[i].value,
    '上证指数': currentDataSet.sz[i].value,
  }));

  const updateSlider = useCallback(() => {
    const activeIdx = periods.indexOf(activePeriod as typeof periods[number]);
    const activeTab = tabRefs.current[activeIdx];
    const container = tabsRef.current;
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const offsetLeft = tabRect.left - containerRect.left - 3;
      setSliderStyle({
        transform: `translateX(${offsetLeft}px)`,
        width: `${tabRect.width}px`,
      });
    }
  }, [activePeriod]);

  useEffect(() => {
    updateSlider();
  }, [updateSlider]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>业绩走势</h3>
          <p className={styles.subtitle}>基金业绩走势</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.legend}>
            {legendItems.map((item) => (
              <div key={item.label} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: item.color }}
                />
                <span className={styles.legendLabel}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.periodTabs} ref={tabsRef}>
            <div
              className={styles.slider}
              style={sliderStyle}
            />
            {periods.map((p, idx) => (
              <button
                key={p}
                ref={(el) => { tabRefs.current[idx] = el; }}
                className={`${styles.tab} ${activePeriod === p ? styles.tabActive : ''}`}
                onClick={() => setActivePeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradientFund" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b5a162" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#b5a162" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="none" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6a7282' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: '#6a7282' }}
              axisLine={false}
              tickLine={false}
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="本基金"
              stroke="#b5a162"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#b5a162', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#ffffff', stroke: '#b5a162', strokeWidth: 2 }}
              fillOpacity={1}
              fill="url(#areaGradientFund)"
              animationDuration={480}
            />
            <Line
              type="monotone"
              dataKey="沪深300"
              stroke="#f59e0b"
              strokeWidth={1.2}
              strokeOpacity={0.45}
              dot={false}
              activeDot={{ r: 3.5, fill: '#ffffff', stroke: '#f59e0b', strokeWidth: 1.5 }}
              animationDuration={480}
            />
            <Line
              type="monotone"
              dataKey="上证指数"
              stroke="#10b981"
              strokeWidth={1.2}
              strokeOpacity={0.45}
              dot={false}
              activeDot={{ r: 3.5, fill: '#ffffff', stroke: '#10b981', strokeWidth: 1.5 }}
              animationDuration={480}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeSummary;
