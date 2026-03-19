'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * 鼠标位置追踪 Hook
 * 返回归一化的鼠标位置（0~1），支持触摸事件
 * 内部使用平滑插值，避免突变
 */
interface SmoothMousePosition {
  x: number;
  y: number;
}

const useSmoothMouse = (smoothFactor = 0.03) => {
  const rawMouse = useRef<SmoothMousePosition>({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef<SmoothMousePosition>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      rawMouse.current.x = e.clientX / window.innerWidth;
      rawMouse.current.y = e.clientY / window.innerHeight;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        rawMouse.current.x = e.touches[0].clientX / window.innerWidth;
        rawMouse.current.y = e.touches[0].clientY / window.innerHeight;
      }
    };

    // client-passive-event-listeners: 不调用 preventDefault，使用 passive 提升滚动性能
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  /**
   * 每帧调用，返回经过平滑插值的鼠标位置
   */
  const update = useCallback(() => {
    smoothMouse.current.x += (rawMouse.current.x - smoothMouse.current.x) * smoothFactor;
    smoothMouse.current.y += (rawMouse.current.y - smoothMouse.current.y) * smoothFactor;
    return smoothMouse.current;
  }, [smoothFactor]);

  return { update };
};

export default useSmoothMouse;
