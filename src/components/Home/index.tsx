'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import HeroContent from '@/components/HeroContent';
import LoadingScreen from '@/components/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import AboutSection from '@/components/AboutSection';

/**
 * 重组件动态导入 — 遵循 bundle-dynamic-imports 规则
 *
 * CloudBackground 依赖 three.js (~300KB)，使用 next/dynamic 按需加载
 * BottomFog 依赖 Canvas 2D，非首屏关键内容，延迟加载
 * CloudOverlay 纯静态 Server Component，直接导入
 */
const CloudBackground = dynamic(
  () => import('@/components/CloudBackground'),
  { ssr: false },
);

const CloudOverlay = dynamic(
  () => import('@/components/CloudOverlay'),
  { ssr: false },
);

const BottomFog = dynamic(
  () => import('@/components/BottomFog'),
  { ssr: false },
);

// 首屏固定层容器样式 — 提升为 GPU 合成层以优化滚动性能
const heroWrapperStyle: React.CSSProperties = {
  willChange: 'opacity',
  backfaceVisibility: 'hidden',
};

/**
 * 首页主体组件 — 出雲資本 Landing Page
 *
 * 页面结构：
 * - 首屏（100vh）：云层背景 + 标题 + 登录弹窗（滚动时淡出）
 * - 下方：关于我们介绍模块（浅色背景，滚动到达）
 *
 * 性能优化：
 * - 首屏淡出使用 GPU 合成层（will-change: opacity）
 * - 完全淡出后暂停 Three.js / Canvas 2D 动画循环
 * - 完全淡出后 visibility: hidden 减少合成开销
 */
const Home = () => {
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  /** 背景纹理加载完成回调 */
  const handleTextureLoaded = useCallback(() => {
    setTextureLoaded(true);
  }, []);

  /** 点击"立即开始" — 切换到登录表单 */
  const handleEnter = useCallback(() => {
    setShowLogin(true);
  }, []);

  /** 关闭登录弹窗 — 返回主页内容 */
  const handleCloseLogin = useCallback(() => {
    setShowLogin(false);
  }, []);

  /**
   * 滚动监听 — 首屏固定层随滚动淡出
   *
   * 优化策略：
   * 1. 直接操作 DOM style（跳过 React re-render）
   * 2. 使用 rAF 节流，一帧只计算一次
   * 3. 完全淡出后暂停 Three.js/Canvas 动画 + visibility: hidden
   * 4. 滚回首屏时恢复动画 + visibility: visible
   */
  useEffect(() => {
    const wrapper = heroWrapperRef.current;
    if (!wrapper) return;

    let ticking = false;
    let wasPaused = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const threshold = window.innerHeight * 0.6;
        const progress = Math.min(scrollY / threshold, 1);
        const opacity = 1 - progress;
        const shouldPause = opacity <= 0;

        wrapper.style.opacity = String(opacity);

        if (shouldPause) {
          wrapper.style.pointerEvents = 'none';
          wrapper.style.visibility = 'hidden';
        } else {
          wrapper.style.pointerEvents = '';
          wrapper.style.visibility = 'visible';
        }

        // 仅在状态切换时触发 React state 更新
        if (shouldPause !== wasPaused) {
          wasPaused = shouldPause;
          setHeroPaused(shouldPause);
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // 初始触发一次（页面刷新时可能已有 scrollY）
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Loading 遮罩 */}
      <LoadingScreen loaded={textureLoaded} />

      {/* 首屏固定层容器 — 随滚动统一淡出，GPU 合成层 */}
      <div ref={heroWrapperRef} style={heroWrapperStyle}>
        {/* Three.js 云层涌动背景（fixed，淡出后暂停） */}
        <CloudBackground onTextureLoaded={handleTextureLoaded} paused={heroPaused} />

        {/* 深色叠加渐变（fixed） */}
        <CloudOverlay />

        {/* 底部云雾粒子（fixed，淡出后暂停） */}
        <BottomFog paused={heroPaused} />

        {/* 前景内容 — 点击按钮后淡出（fixed） */}
        <HeroContent hidden={showLogin} onEnter={handleEnter} />

        {/* 登录表单 — 标题淡出后入场（fixed） */}
        <LoginForm visible={showLogin} onClose={handleCloseLogin} />
      </div>

      {/* 首屏占位 — 撑开 100vh 高度供滚动 */}
      <div style={{ height: '100vh', pointerEvents: 'none' }} />

      {/* 关于我们模块 — 滚动到下方查看（浅色背景） */}
      <AboutSection />
    </>
  );
};

export default Home;
