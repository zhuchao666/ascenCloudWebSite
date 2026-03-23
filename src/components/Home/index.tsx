'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import HeroContent from '@/components/Home/HeroContent';
import LoadingScreen from '@/components/LoadingScreen';
import LoginForm from '@/components/Home/LoginForm';
import AboutSection from '@/components/Home/AboutSection';
import ProductSection from '@/components/Home/ProductSection';

/** 页面总数 */
const TOTAL_PAGES = 3;

/** wheel 累计量触发翻页的阈值（像素） */
const WHEEL_THRESHOLD = 80;

/** 触摸滑动触发翻页的阈值（像素） */
const TOUCH_THRESHOLD = 40;

/** 翻页动画持续时间（ms） */
const TRANSITION_DURATION = 800;

/** 翻页动画后的冷却时间（ms），防止连续触发 */
const COOLDOWN = TRANSITION_DURATION + 200;

/**
 * 注意：首屏固定层容器**不能**设置以下任何属性：
 * - willChange（包括 'opacity', 'transform' 等）
 * - backfaceVisibility: 'hidden'
 * - transform（任何非 none 值）
 * - filter / backdrop-filter
 * - contain: paint / contain: layout
 *
 * 因为这些属性都会创建新的"包含块"(containing block)，导致内部
 * position: fixed 子元素不再相对视口定位，而是相对该容器定位。
 * iOS Safari 严格遵循此规范，Chrome 在部分情况下表现更宽容，
 * 这就是导致两浏览器布局不一致的根本原因。
 *
 * JS 通过 ref 直接操作 opacity 是安全的 —— opacity 本身只创建层叠上下文，
 * 不创建新的包含块。
 */

/**
 * 首页主体组件 — 出雲资本 Landing Page
 *
 * 翻页机制：
 * - 监听 wheel / touch 手势，累计滚动量达到阈值后自动翻页
 * - 使用 CSS scroll-snap 作为目标锚点，scrollTo smooth 驱动动画
 * - 翻页动画期间 + 冷却期锁定输入，防止连续触发
 * - 首屏淡出后暂停视频节省资源
 */
const Home = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  /** 控制 HeroContent 标题是否隐藏 */
  const [hideHero, setHideHero] = useState(false);
  /** 控制 LoginForm 是否可见（延迟于 hideHero） */
  const [showLogin, setShowLogin] = useState(false);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const showLoginRef = useRef(false);

  // 翻页状态 refs（不触发重渲染）
  const currentPageRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const wheelAccRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartYRef = useRef(0);

  /**
   * 首页隐藏滚动条 — 翻页由手势接管，不需要原生滚动条
   */
  useEffect(() => {
    document.documentElement.classList.add('hide-scrollbar');
    return () => {
      document.documentElement.classList.remove('hide-scrollbar');
    };
  }, []);

  /**
   * 设置 CSS 变量 --vh，解决 iOS Safari/微信底部工具栏导致 100vh 抖动的问题
   * 只在初始化和横竖屏切换时更新，不监听普通 resize（工具栏收起会触发 resize）
   */
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();

    // 仅监听 orientationchange（横竖屏切换），不监听 resize
    window.addEventListener('orientationchange', () => {
      // 延迟一帧等 iOS 完成旋转
      setTimeout(setVh, 100);
    });

    return () => {
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  /** 背景视频可播放回调 */
  const handleVideoLoaded = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  /** 点击"立即开始" — 先隐藏标题，再淡入登录表单 */
  const handleEnter = useCallback(() => {
    // 第一步：立即隐藏标题
    setHideHero(true);
    showLoginRef.current = true;
    // 锁定 body 滚动，防止 iOS 键盘弹起时页面被推动
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // 锁定 body 位置，防止 iOS Safari 键盘弹起导致的 fixed 元素偏移
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.bottom = '0';
    // 确保停留在首页
    window.scrollTo(0, 0);
    // 第二步：延迟 100ms 后显示表单，确保标题已消失再淡入
    setTimeout(() => {
      setShowLogin(true);
    }, 100);
  }, []);

  /** 关闭登录弹窗 — 弹窗直接消失，同时标题淡入 */
  const handleCloseLogin = useCallback(() => {
    setShowLogin(false);
    showLoginRef.current = false;
    // 弹窗直接消失，同时标题开始淡入
    setHideHero(false);
    // 恢复 body 定位和滚动
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.bottom = '';
    // 恢复滚动位置
    window.scrollTo(0, 0);
  }, []);

  /**
   * 获取每页的实际高度（即 --vh * 100）
   * 与 CSS calc(var(--vh, 1vh) * 100) 保持完全一致，
   * 避免 iOS Safari 地址栏收起/展开导致 innerHeight 与 section 实际高度不匹配
   */
  const getPageHeight = useCallback(() => {
    const vhStr = getComputedStyle(document.documentElement).getPropertyValue('--vh').trim();
    const vhPx = parseFloat(vhStr);
    // --vh 是 innerHeight * 0.01，所以 --vh * 100 = 当时的 innerHeight
    // 如果 --vh 还没被设置或解析失败，则退回 innerHeight
    return vhPx > 0 ? vhPx * 100 : window.innerHeight;
  }, []);

  /**
   * 跳转到指定页
   * 使用 requestAnimationFrame 手动实现平滑滚动，
   * 兼容 iOS Safari/微信浏览器（不依赖 scrollTo smooth）
   */
  const goToPage = useCallback((page: number) => {
    const target = Math.max(0, Math.min(page, TOTAL_PAGES - 1));
    if (isAnimatingRef.current) return;

    // 已在目标页 — 不翻页，但检查 scrollY 是否对齐（修正可能的微小偏移）
    if (target === currentPageRef.current) {
      const expectedScroll = target * getPageHeight();
      if (Math.abs(window.scrollY - expectedScroll) > 1) {
        window.scrollTo(0, expectedScroll);
      }
      return;
    }

    isAnimatingRef.current = true;
    currentPageRef.current = target;

    const pageHeight = getPageHeight();
    const scrollTarget = target * pageHeight;
    const startY = window.scrollY;
    const diff = scrollTarget - startY;
    const startTime = performance.now();

    // easeInOutCubic 缓动
    const ease = (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
      const eased = ease(progress);

      window.scrollTo(0, startY + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);

    // 冷却结束后解锁
    setTimeout(() => {
      isAnimatingRef.current = false;
      wheelAccRef.current = 0;
    }, COOLDOWN);
  }, [getPageHeight]);

  /**
   * 滚动位置监听 — 首屏固定层淡出 + 暂停动画
   */
  useEffect(() => {
    const wrapper = heroWrapperRef.current;
    if (!wrapper) return;

    let wasPaused = false;

    const syncHeroOpacity = () => {
      const scrollY = window.scrollY;

      // 登录弹窗可见时强制锁定在首页，防止 iOS 键盘弹起顶起页面
      if (showLoginRef.current && scrollY > 0) {
        window.scrollTo(0, 0);
        return;
      }

      const pageHeight = getPageHeight();
      // 在 0~pageHeight 之间线性淡出
      const progress = Math.min(scrollY / pageHeight, 1);
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
        // 翻页离开首屏时暂停视频，返回首屏时恢复播放
        if (videoRef.current) {
          if (shouldPause) {
            videoRef.current.pause();
          } else {
            videoRef.current.play().catch(() => {});
          }
        }
      }
    };

    window.addEventListener('scroll', syncHeroOpacity, { passive: true });
    syncHeroOpacity();

    return () => {
      window.removeEventListener('scroll', syncHeroOpacity);
    };
  }, [getPageHeight]);

  /**
   * 手势翻页 — PC 端 wheel + 移动端 touch
   *
   * wheel: 累计 deltaY，超过阈值则翻页；长时间无输入自动重置累计量
   * touch: touchstart 记录起始 Y，touchmove 实时判断翻页并阻止原生滚动（无滚动条）
   */
  useEffect(() => {
    // ---- wheel 事件（PC） ----
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimatingRef.current || showLoginRef.current) return;

      wheelAccRef.current += e.deltaY;

      // 重置累计量的定时器（200ms 无新 wheel 事件则清零）
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
      wheelTimerRef.current = setTimeout(() => {
        wheelAccRef.current = 0;
      }, 200);

      if (wheelAccRef.current > WHEEL_THRESHOLD) {
        goToPage(currentPageRef.current + 1);
      } else if (wheelAccRef.current < -WHEEL_THRESHOLD) {
        goToPage(currentPageRef.current - 1);
      }
    };

    // ---- touch 事件（移动端） ----
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 阻止原生触摸滚动 — 双重保险（CSS touch-action: none 已在浏览器层面禁用）
      e.preventDefault();

      if (isAnimatingRef.current || showLoginRef.current) return;

      const deltaY = touchStartYRef.current - e.touches[0].clientY;

      if (deltaY > TOUCH_THRESHOLD) {
        // 向上滑 → 下一页
        touchStartYRef.current = e.touches[0].clientY;
        goToPage(currentPageRef.current + 1);
      } else if (deltaY < -TOUCH_THRESHOLD) {
        // 向下滑 → 上一页
        touchStartYRef.current = e.touches[0].clientY;
        goToPage(currentPageRef.current - 1);
      }
    };

    // wheel 需要 { passive: false } 才能 preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    // touchmove 必须 { passive: false } 才能 preventDefault 阻止原生滚动
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
    };
  }, [goToPage]);

  /**
   * 页面刷新 / 初始化 — 根据当前 scrollY 同步 currentPageRef
   */
  useEffect(() => {
    const pageHeight = getPageHeight();
    const page = Math.round(window.scrollY / pageHeight);
    currentPageRef.current = Math.min(page, TOTAL_PAGES - 1);
  }, [getPageHeight]);

  return (
    <>
      {/* Loading 遮罩 */}
      <LoadingScreen loaded={videoLoaded} />

      {/* 首屏固定层容器 — 随翻页淡出（JS 操控 opacity） */}
      <div ref={heroWrapperRef}>
        {/* 兜底背景图 — 视频未加载完成时展示，加载完成后淡出 */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url(https://cdn.meeting.tencent.com/pro/ZDVkNzdjNjYtNWZiMy00NjU0LWE3YmEtZmYyMzliMGE5ZjFk.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: videoLoaded ? 0 : 1,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* MP4 视频背景（fixed，循环播放，翻页后暂停） */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onCanPlayThrough={handleVideoLoaded}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
            // 略微放大，遮盖视频源上下边沿的黑线
            transform: 'scale(1.02)',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>

        {/* 深色叠加渐变 — 增强文字可读性 */}
        {
          showLogin && (<div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: `linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.45) 0%,
              rgba(0, 0, 0, 0.2) 40%,
              rgba(0, 0, 0, 0.15) 60%,
              rgba(0, 0, 0, 0.5) 100%
            )`,
          }}
          />)
        }

        {/* 前景内容 — 点击按钮后直接消失（fixed） */}
        <HeroContent hidden={hideHero} onEnter={handleEnter} />

        {/* 登录表单 — 标题淡出后入场（fixed） */}
        <LoginForm visible={showLogin} onClose={handleCloseLogin} />
      </div>

      {/* 第一页占位（首屏内容由 fixed 层渲染） */}
      <div style={{ height: 'calc(var(--vh, 1vh) * 100)', pointerEvents: 'none' }} />

      {/* 第二页 — 关于我们模块 */}
      <AboutSection />

      {/* 第三页 — 产品展示模块 */}
      <ProductSection />
    </>
  );
};

export default Home;
