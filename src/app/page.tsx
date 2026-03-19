'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import HeroContent from '@/components/HeroContent';
import LoadingScreen from '@/components/LoadingScreen';

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

/**
 * 首页 — 出雲資本 Landing Page
 *
 * 层级结构（从后到前）：
 * 1. CloudBackground (z=0)   — Three.js shader 云层涌动背景
 * 2. CloudOverlay (z=1)      — 深色渐变遮罩
 * 3. BottomFog (z=2)         — Canvas 2D 底部云雾粒子
 * 4. HeroContent (z=10)      — 标题 + 副标题 + 按钮
 * 5. LoadingScreen (z=100)   — 加载遮罩（加载完成后淡出消失）
 */
const HomePage = () => {
  const [textureLoaded, setTextureLoaded] = useState(false);

  /** 背景纹理加载完成回调 */
  const handleTextureLoaded = useCallback(() => {
    setTextureLoaded(true);
  }, []);

  return (
    <>
      {/* Loading 遮罩 */}
      <LoadingScreen loaded={textureLoaded} />

      {/* Three.js 云层涌动背景 */}
      <CloudBackground onTextureLoaded={handleTextureLoaded} />

      {/* 深色叠加渐变 */}
      <CloudOverlay />

      {/* 底部云雾粒子 */}
      <BottomFog />

      {/* 前景内容 */}
      <HeroContent />
    </>
  );
};

export default HomePage;
