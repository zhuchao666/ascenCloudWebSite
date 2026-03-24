'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './index.module.css';

interface DataPoint {
  date: string;
  value: number;
}

interface PeriodDataSet {
  fund: DataPoint[];
  hs300: DataPoint[];
  sz: DataPoint[];
  maxVal: number;
  yTicks: number[];
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
  maxVal: 8,
  yTicks: [0, 2, 4, 6, 8],
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
  maxVal: 10,
  yTicks: [0, 2, 4, 6, 8, 10],
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
  maxVal: 14,
  yTicks: [0, 2, 4, 6, 8, 10, 12, 14],
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
  maxVal: 20,
  yTicks: [0, 4, 8, 12, 16, 20],
};

const periodDataMap: Record<string, PeriodDataSet> = {
  '近3月': period3m,
  '近6月': period6m,
  '近1年': period1y,
  '成立来': periodAll,
};

const periods = ['近3月', '近6月', '近1年', '成立来'] as const;

const legendItems = [
  { label: '本基金', color: 'linear-gradient(90deg, #b5a162, #c4b070)' },
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

// 生成平滑曲线路径（Catmull-Rom → Cubic Bezier）
const buildSmoothPath = (
  points: { x: number; y: number }[],
  tension = 0.3,
): string => {
  if (points.length < 2) return '';
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

// 线性插值工具
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 对两组数值数组做插值
const lerpValues = (from: number[], to: number[], t: number) =>
  from.map((v, i) => lerp(v, to[i], t));

// easeInOutCubic 缓动
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const ANIM_DURATION = 480; // ms

const IncomeSummary = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activePeriod, setActivePeriod] = useState<string>('近6月');
  const [sliderStyle, setSliderStyle] = useState<{ transform: string; width: string }>({
    transform: 'translateX(0px)',
    width: '0px',
  });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 动画状态：存储当前插值后的 value 数组
  const currentDataSet = periodDataMap[activePeriod];
  const [animFund, setAnimFund] = useState<number[]>(currentDataSet.fund.map((d) => d.value));
  const [animHs300, setAnimHs300] = useState<number[]>(currentDataSet.hs300.map((d) => d.value));
  const [animSz, setAnimSz] = useState<number[]>(currentDataSet.sz.map((d) => d.value));
  const [animMaxVal, setAnimMaxVal] = useState<number>(currentDataSet.maxVal);
  const [animYTicks, setAnimYTicks] = useState<number[]>(currentDataSet.yTicks);
  const [displayDates, setDisplayDates] = useState<string[]>(currentDataSet.fund.map((d) => d.date));

  // 保留上一帧实际渲染值的 ref，防止连续快速切换抖动
  const prevFundRef = useRef<number[]>(animFund);
  const prevHs300Ref = useRef<number[]>(animHs300);
  const prevSzRef = useRef<number[]>(animSz);
  const prevMaxRef = useRef<number>(animMaxVal);
  const animFrameRef = useRef<number>(0);

  // 切换 period 时触发动画
  useEffect(() => {
    const target = periodDataMap[activePeriod];
    const fromFund = prevFundRef.current;
    const fromHs300 = prevHs300Ref.current;
    const fromSz = prevSzRef.current;
    const fromMax = prevMaxRef.current;

    const toFund = target.fund.map((d) => d.value);
    const toHs300 = target.hs300.map((d) => d.value);
    const toSz = target.sz.map((d) => d.value);
    const toMax = target.maxVal;

    // 立即更新日期标签和 yTicks（不做数值插值）
    setDisplayDates(target.fund.map((d) => d.date));
    setAnimYTicks(target.yTicks);

    const start = performance.now();
    cancelAnimationFrame(animFrameRef.current);

    const tick = (now: number) => {
      const elapsed = now - start;
      const rawT = Math.min(elapsed / ANIM_DURATION, 1);
      const t = easeInOutCubic(rawT);

      const curFund = lerpValues(fromFund, toFund, t);
      const curHs300 = lerpValues(fromHs300, toHs300, t);
      const curSz = lerpValues(fromSz, toSz, t);
      const curMax = lerp(fromMax, toMax, t);

      setAnimFund(curFund);
      setAnimHs300(curHs300);
      setAnimSz(curSz);
      setAnimMaxVal(curMax);

      prevFundRef.current = curFund;
      prevHs300Ref.current = curHs300;
      prevSzRef.current = curSz;
      prevMaxRef.current = curMax;

      if (rawT < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animFrameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod]);

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

  // ── 图表绘制 ──
  const chartW = 800;
  const chartH = 220;
  const paddingX = 50;
  const paddingY = 20;
  const plotW = chartW - paddingX * 2;
  const plotH = chartH - paddingY * 2;

  const dataLen = animFund.length;
  const getX = (i: number) => paddingX + (i / (dataLen - 1)) * plotW;
  const getY = (val: number) => paddingY + plotH - ((val - 0) / (animMaxVal - 0)) * plotH;

  const fundPoints = animFund.map((v, i) => ({ x: getX(i), y: getY(v) }));
  const hs300Points = animHs300.map((v, i) => ({ x: getX(i), y: getY(v) }));
  const szPoints = animSz.map((v, i) => ({ x: getX(i), y: getY(v) }));

  const fundPath = buildSmoothPath(fundPoints);
  const hs300Path = buildSmoothPath(hs300Points);
  const szPath = buildSmoothPath(szPoints);

  const areaPath = `${fundPath} L ${getX(dataLen - 1)} ${chartH - paddingY} L ${paddingX} ${chartH - paddingY} Z`;

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
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className={styles.chart}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b5a162" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#b5a162" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b5a162" />
              <stop offset="100%" stopColor="#c4b070" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {animYTicks.map((tick) => (
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

          {/* Y axis labels (百分比) */}
          {animYTicks.map((tick) => (
            <text
              key={`y-${tick}`}
              x={paddingX - 8}
              y={getY(tick) + 4}
              textAnchor="end"
              className={styles.axisLabel}
            >
              {`${tick}%`}
            </text>
          ))}

          {/* Area fill (基金主线) */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* 沪深300 曲线（淡色、细线） */}
          <path
            d={hs300Path}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />

          {/* 上证指数 曲线（淡色、细线） */}
          <path
            d={szPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />

          {/* 基金主线（粗、渐变） */}
          <path
            d={fundPath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points & interactions */}
          {animFund.map((val, i) => (
            <g key={i}>
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

              {/* 基金主线圆点 */}
              <circle
                cx={getX(i)}
                cy={getY(val)}
                r={hoveredIndex === i ? 5 : 3.5}
                fill="#ffffff"
                stroke="url(#lineGradient)"
                strokeWidth="2"
              />

              {/* Hover vertical line */}
              {hoveredIndex === i && (
                <line
                  x1={getX(i)}
                  y1={paddingY}
                  x2={getX(i)}
                  y2={chartH - paddingY}
                  stroke="#b5a162"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.3"
                />
              )}

              {/* hover 时显示沪深300 和上证指数的小圆点 */}
              {hoveredIndex === i && (
                <>
                  <circle
                    cx={getX(i)}
                    cy={getY(animHs300[i])}
                    r={3.5}
                    fill="#ffffff"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                  <circle
                    cx={getX(i)}
                    cy={getY(animSz[i])}
                    r={3.5}
                    fill="#ffffff"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                </>
              )}

              {/* X axis labels (具体日期) */}
              <text
                x={getX(i)}
                y={chartH - 2}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {formatDate(displayDates[i])}
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
              top: `${(getY(animFund[hoveredIndex]) / chartH) * 100 - 18}%`,
            }}
          >
            <div className={styles.tooltipDate}>
              {displayDates[hoveredIndex]}
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: '#b5a162' }} />
              <span className={styles.tooltipLabel}>本基金</span>
              <span className={styles.tooltipVal}>
                {animFund[hoveredIndex].toFixed(2)}%
              </span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: '#f59e0b' }} />
              <span className={styles.tooltipLabel}>沪深300</span>
              <span className={styles.tooltipVal}>
                {animHs300[hoveredIndex].toFixed(2)}%
              </span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: '#10b981' }} />
              <span className={styles.tooltipLabel}>上证指数</span>
              <span className={styles.tooltipVal}>
                {animSz[hoveredIndex].toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeSummary;
