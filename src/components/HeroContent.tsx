'use client';

import { useCallback, useState } from 'react';
import styles from './HeroContent.module.css';

/**
 * 首页前景内容组件
 *
 * 包含：
 * - 顶部标签（Sanctuary in the Sky）
 * - 主标题（出雲資本）
 * - 副标题（AscenCloud Investment）
 * - 进入按钮
 *
 * 所有文字元素带入场动画（fadeIn / fadeInUp），
 * pointer-events: none 确保不阻挡背景交互
 */
const HeroContent = () => {
  const [btnHidden, setBtnHidden] = useState(false);

  /** 点击"立即开始"按钮 — 淡出隐藏 */
  const handleEnter = useCallback(() => {
    setBtnHidden(true);
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.tag}>Sanctuary in the Sky</div>
      <div className={styles.title}>出雲資本</div>
      <div className={styles.subtitle}>AscenCloud Investment</div>
      <button
        className={`${styles.enterBtn} ${btnHidden ? styles.enterBtnHidden : ''}`}
        onClick={handleEnter}
      >
        立即开始
      </button>
    </div>
  );
};

export default HeroContent;
