'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './LoadingScreen.module.css';

/**
 * Loading 遮罩组件
 *
 * 功能：
 * - 模拟加载进度条（0%~100%，非线性递增）
 * - 纹理实际加载完成后快速填满到 100%
 * - 进度完成后淡出隐藏
 */
interface LoadingScreenProps {
  /** 资源是否已加载完成 */
  loaded: boolean;
}

const LoadingScreen = ({ loaded }: LoadingScreenProps) => {
  // 分离两个状态：fading 控制 CSS 淡出动画，removed 控制从 DOM 中移除
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  /**
   * 当进度完成后，先触发淡出动画，动画结束后移除 DOM
   */
  const handleComplete = useCallback(() => {
    setFading(true);
    // 与 CSS transition 时长 0.4s 匹配
    setTimeout(() => {
      setRemoved(true);
    }, 450);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    /** 进度条走满时长（ms） */
    const FILL_DURATION = 600;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // 如果资源已加载完，立即跳到 100%；否则在 FILL_DURATION 内匀速走完
      if (loaded) {
        progressRef.current = 100;
      } else {
        progressRef.current = Math.min((elapsed / FILL_DURATION) * 100, 100);
      }

      if (fillRef.current) {
        fillRef.current.style.width = `${progressRef.current}%`;
      }

      if (progressRef.current >= 100) {
        clearInterval(interval);
        handleComplete();
      }
    }, 30);

    return () => {
      clearInterval(interval);
    };
  }, [loaded, handleComplete]);

  // rendering-conditional-render: 显式条件渲染，移除后不再占用 DOM
  if (removed) {
    return null;
  }

  return (
    <div className={`${styles.loader} ${fading ? styles.hidden : ''}`}>
      <div className={styles.loaderText}>Loading</div>
      <div className={styles.loaderBar}>
        <div ref={fillRef} className={styles.loaderBarFill} />
      </div>
    </div>
  );
};

export default LoadingScreen;
