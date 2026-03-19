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
    // 与 CSS transition 时长 1.5s 匹配
    setTimeout(() => {
      setRemoved(true);
    }, 1600);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (loaded) {
        progressRef.current = 100;
      } else {
        // 模拟加载：非线性递增，越接近 100 越慢
        progressRef.current += (100 - progressRef.current) * 0.03;
      }

      if (fillRef.current) {
        fillRef.current.style.width = `${Math.min(progressRef.current, 100)}%`;
      }

      if (progressRef.current >= 99.5 && loaded) {
        clearInterval(interval);
        if (fillRef.current) {
          fillRef.current.style.width = '100%';
        }
        handleComplete();
      }
    }, 50);

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
