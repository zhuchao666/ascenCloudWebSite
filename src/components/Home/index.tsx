'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import HeroContent from '@/components/HeroContent';
import LoadingScreen from '@/components/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import AboutSection from '@/components/AboutSection';
import ProductSection from '@/components/ProductSection';

/**
 * 重组件动态导入 — 遵循 bundle-dynamic-imports 规则
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

/** 页面总数 */
const TOTAL_PAGES = 3;

/** wheel 累计量触发翻页的阈值（像素） */
const WHEEL_THRESHOLD = 80;

/** 触摸滑动触发翻页的阈值（像素） */
const TOUCH_THRESHOLD = 60;

/** 翻页动画持续时间（ms） */
const TRANSITION_DURATION = 800;

/** 翻页动画后的冷却时间（ms），防止连续触发 */
const COOLDOWN = TRANSITION_DURATION + 200;

// 首屏固定层容器样式 — GPU 合成层
const heroWrapperStyle: React.CSSProperties = {
  willChange: 'opacity',
  backfaceVisibility: 'hidden',
};

/**
 * 首页主体组件 — 出雲资本 Landing Page
 *
 * 翻页机制：
 * - 监听 wheel / touch 手势，累计滚动量达到阈值后自动翻页
 * - 使用 CSS scroll-snap 作为目标锚点，scrollTo smooth 驱动动画
 * - 翻页动画期间 + 冷却期锁定输入，防止连续触发
 * - 首屏淡出后暂停 Three.js / Canvas 2D 节省 GPU
 */
const Home = () => {
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  // 翻页状态 refs（不触发重渲染）
  const currentPageRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const wheelAccRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartYRef = useRef(0);

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
   * 跳转到指定页
   * 直接操作 DOM + scrollTo，不经过 React re-render 驱动动画
   */
  const goToPage = useCallback((page: number) => {
    const target = Math.max(0, Math.min(page, TOTAL_PAGES - 1));
    if (target === currentPageRef.current) return;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    currentPageRef.current = target;

    // 计算目标滚动位置（每页 100vh）
    const scrollTarget = target * window.innerHeight;

    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth',
    });

    // 冷却结束后解锁
    setTimeout(() => {
      isAnimatingRef.current = false;
      wheelAccRef.current = 0;
    }, COOLDOWN);
  }, []);

  /**
   * 滚动位置监听 — 首屏固定层淡出 + 暂停动画
   */
  useEffect(() => {
    const wrapper = heroWrapperRef.current;
    if (!wrapper) return;

    let wasPaused = false;

    const syncHeroOpacity = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // 在 0~100vh 之间线性淡出
      const progress = Math.min(scrollY / vh, 1);
      const opacity = 1 - progress;
      const shouldPause = opacity <= 0.01;

      wrapper.style.opacity = String(Math.max(opacity, 0));

      if (shouldPause) {
        wrapper.style.pointerEvents = 'none';
        wrapper.style.visibility = 'hidden';
      } else {
        wrapper.style.pointerEvents = '';
        wrapper.style.visibility = 'visible';
      }

      if (shouldPause !== wasPaused) {
        wasPaused = shouldPause;
        setHeroPaused(shouldPause);
      }
    };

    window.addEventListener('scroll', syncHeroOpacity, { passive: true });
    syncHeroOpacity();

    return () => {
      window.removeEventListener('scroll', syncHeroOpacity);
    };
  }, []);

  /**
   * 手势翻页 — wheel + touch
   *
   * wheel: 累计 deltaY，超过阈值则翻页；长时间无输入自动重置累计量
   * touch: touchstart 记录起始 Y，touchend 计算位移方向
   */
  useEffect(() => {
    // ---- wheel 事件 ----
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimatingRef.current) return;

      wheelAccRef.current += e.deltaY;

      // 重置累计量的定时器（200ms 无新 wheel 事件则清零）
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
      wheelTimerRef.current = setTimeout(() => {
        wheelAccRef.current = 0;
      }, 200);

      if (wheelAccRef.current > WHEEL_THRESHOLD) {
        // 向下翻页
        goToPage(currentPageRef.current + 1);
      } else if (wheelAccRef.current < -WHEEL_THRESHOLD) {
        // 向上翻页
        goToPage(currentPageRef.current - 1);
      }
    };

    // ---- touch 事件 ----
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;

      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;

      if (deltaY > TOUCH_THRESHOLD) {
        goToPage(currentPageRef.current + 1);
      } else if (deltaY < -TOUCH_THRESHOLD) {
        goToPage(currentPageRef.current - 1);
      }
    };

    // wheel 需要 { passive: false } 才能 preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
    };
  }, [goToPage]);

  /**
   * 页面刷新 / 初始化 — 根据当前 scrollY 同步 currentPageRef
   */
  useEffect(() => {
    const vh = window.innerHeight;
    const page = Math.round(window.scrollY / vh);
    currentPageRef.current = Math.min(page, TOTAL_PAGES - 1);
  }, []);

  return (
    <>
      {/* Loading 遮罩 */}
      <LoadingScreen loaded={textureLoaded} />

      {/* 首屏固定层容器 — 随翻页淡出，GPU 合成层 */}
      <div ref={heroWrapperRef} style={heroWrapperStyle}>
        {/* Three.js 云层涌动背景（fixed，翻页后暂停） */}
        <CloudBackground onTextureLoaded={handleTextureLoaded} paused={heroPaused} />

        {/* 深色叠加渐变（fixed） */}
        <CloudOverlay />

        {/* 底部云雾粒子（fixed，翻页后暂停） */}
        <BottomFog paused={heroPaused} />

        {/* 前景内容 — 点击按钮后淡出（fixed） */}
        <HeroContent hidden={showLogin} onEnter={handleEnter} />

        {/* 登录表单 — 标题淡出后入场（fixed） */}
        <LoginForm visible={showLogin} onClose={handleCloseLogin} />
      </div>

      {/* 第一页占位 — 100vh（首屏内容由 fixed 层渲染） */}
      <div style={{ height: '100vh', pointerEvents: 'none' }} />

      {/* 第二页 — 关于我们模块 */}
      <AboutSection />

      {/* 第三页 — 产品展示模块 */}
      <ProductSection />
    </>
  );
};

export default Home;
