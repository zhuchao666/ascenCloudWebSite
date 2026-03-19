'use client';

import { useCallback } from 'react';
import styles from './HeroContent.module.css';

interface HeroContentProps {
  /** 内容是否隐藏（点击按钮后淡出） */
  hidden: boolean;
  /** 点击"立即开始"按钮回调 */
  onEnter: () => void;
}

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
 * 点击按钮后整体淡出，交由父组件显示登录表单。
 * pointer-events: none 确保不阻挡背景交互
 */
const HeroContent = ({ hidden, onEnter }: HeroContentProps) => {
  /** 点击"立即开始"按钮 — 通知父组件切换到登录状态 */
  const handleEnter = useCallback(() => {
    onEnter();
  }, [onEnter]);

  return (
    <div className={`${styles.content} ${hidden ? styles.contentHidden : ''}`}>
      <div className={styles.tag}>Sanctuary in the Sky</div>
      <div className={styles.title}>出雲資本</div>
      <div className={styles.subtitle}>AscenCloud Investment</div>
      <button
        className={styles.enterBtn}
        onClick={handleEnter}
      >
        立即开始
      </button>
    </div>
  );
};

export default HeroContent;
