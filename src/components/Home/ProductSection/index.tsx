'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ProductSection.module.css';

/**
 * 量化策略图标 — 网格/数据可视化
 * 象征系统性、数据驱动的量化交易
 */
const QuantIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="28" y="4" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="28" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="28" y="28" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="12" x2="36" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="12" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="12" y1="12" x2="12" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="36" y1="12" x2="36" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </svg>
);

/**
 * 主观策略图标 — 罗盘/指南针
 * 象征经验驱动、洞察力与判断力
 */
const SubjectiveIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="2" fill="currentColor" opacity="0.4" />
    <line x1="24" y1="8" x2="24" y2="16" stroke="currentColor" strokeWidth="1.5" />
    <line x1="24" y1="32" x2="24" y2="40" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="24" x2="16" y2="24" stroke="currentColor" strokeWidth="1.5" />
    <line x1="32" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="1.5" />
    <path d="M24 8 L26 14 L24 12 L22 14 Z" fill="currentColor" opacity="0.5" />
  </svg>
);

/**
 * 产品展示 + 合作伙伴模块
 *
 * 梯形卡片交错布局（clip-path + 绝对定位）：
 * - 左卡片：左边垂直，右边斜切；默认为激活态（大且高）
 * - 右卡片：左边斜切，右边垂直；默认为非激活态（小且矮）
 * - hover 时激活卡片更高更宽，非激活卡片更矮更窄
 * - 两张卡片斜边平行，中间留有缝隙，形成"Z"字交错
 *
 * 底部合作伙伴区域：
 * - 居中展示唯一合作伙伴「思维刻度」
 */
const ProductSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<'none' | 'left' | 'right'>('none');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleMouseEnterLeft = useCallback(() => setHovered('left'), []);
  const handleMouseEnterRight = useCallback(() => setHovered('right'), []);
  const handleMouseLeave = useCallback(() => setHovered('none'), []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* ====== 标题区域 ====== */}
      <div className={styles.header}>
        {/* 装饰分割线 */}
        <div className={`${styles.divider} ${visible ? styles.dividerVisible : ''}`} />

        {/* 小标签 */}
        <div className={`${styles.tag} ${visible ? styles.tagVisible : ''}`}>
          Our Products
        </div>

        {/* 大标题 */}
        <h2 className={`${styles.title} ${visible ? styles.titleVisible : ''}`}>
          核心产品
        </h2>

        {/* 英文副标题 */}
        <div className={`${styles.subtitle} ${visible ? styles.subtitleVisible : ''}`}>
          Core Investment Strategies
        </div>
      </div>

      {/* ====== 梯形卡片区域 — 绝对定位交错布局 ====== */}
      <div className={`${styles.cardContainer} ${visible ? styles.cardContainerVisible : ''}`}>
        {/* 左卡片 — 天璇量化策略（梯形：左垂直，右斜切） */}
        <div
          className={`${styles.card} ${styles.cardLeft} ${hovered === 'left' || hovered === 'none' ? styles.cardActive : ''} ${hovered === 'right' ? styles.cardInactive : ''}`}
          onMouseEnter={handleMouseEnterLeft}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.cardShape}>
            <div className={styles.cardBg} />
          </div>

          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>
              <QuantIcon />
            </div>
            <div className={styles.cardName}>天璇量化策略</div>
            <div className={styles.cardDesc}>
              指增型量化交易基金，依托自主研发的多因子模型与高频信号系统，
              以严格的风控体系追求稳定超额收益。
            </div>
          </div>

          <div className={styles.cardLabel}>Tianxuan Quantitative</div>
        </div>

        {/* 右卡片 — 玉衡主观策略（梯形：左斜切，右垂直） */}
        <div
          className={`${styles.card} ${styles.cardRight} ${hovered === 'right' ? styles.cardActive : ''} ${hovered === 'left' || hovered === 'none' ? styles.cardInactive : ''}`}
          onMouseEnter={handleMouseEnterRight}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.cardShape}>
            <div className={styles.cardBg} />
          </div>

          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>
              <SubjectiveIcon />
            </div>
            <div className={styles.cardName}>玉衡主观策略</div>
            <div className={styles.cardDesc}>
              主观型投资策略，融合深度基本面研究与宏观趋势判断，
              由资深投资团队精选标的，捕捉结构性机遇。
            </div>
          </div>

          <div className={styles.cardLabel}>Yuheng Discretionary</div>
        </div>
      </div>

      {/* ====== 合作伙伴区域 ====== */}
      <div className={`${styles.partnerArea} ${visible ? styles.partnerAreaVisible : ''}`}>
        {/* 分隔线 */}
        <div className={styles.partnerDivider} />

        {/* 小标签 */}
        <div className={styles.partnerTag}>
          Strategic Partner
        </div>

        {/* 大标题 */}
        <h3 className={styles.partnerTitle}>合作伙伴</h3>

        {/* 英文副标题 */}
        <div className={styles.partnerSubtitle}>
          Trusted Alliance
        </div>

        {/* 合作伙伴 Logo — 思维刻度（SavorCode） */}
        <a
          href="https://www.savorcode.com?ref=ascencloud"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.partnerLink}
        >
          <img src="/savorcode.svg" alt="思维刻度 SavorCode" className={styles.partnerLogoImg} />
        </a>
      </div>
    </section>
  );
};

export default ProductSection;
