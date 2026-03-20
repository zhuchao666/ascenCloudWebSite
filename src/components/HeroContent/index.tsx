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
 * - 主标题（出雲资本）
 * - 中文副标题（拨云见日 洞见未来）
 * - 英文副标题（AscenCloud Investment）
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
      <div className={styles.title}>出雲资本</div>
      <div className={styles.slogan}>拨云见日 洞见未来</div>
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
