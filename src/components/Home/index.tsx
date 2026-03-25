'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Home/Header';
import HeroContent from '@/components/Home/HeroContent';
import AboutSection from '@/components/Home/AboutSection';
import ProductSection from '@/components/Home/ProductSection';
import LoginForm from '@/components/Home/LoginForm';

/**
 * 首页主体组件 — 出雲资本 Landing Page
 *
 * 桥水基金设计风格：
 * - 顶部固定 Header（logo + 登录入口）
 * - 内容区正常文档流滚动（无翻页机制）
 * - 简洁专业的浅色背景
 *
 * 页面结构（从上到下）：
 * 1. Header — 固定顶部导航
 * 2. HeroContent — 首屏背景大图
 * 3. AboutSection — 关于我们（芒格头像 + 格言 + 公司介绍）
 * 4. ProductSection — 核心产品 + 合作伙伴
 * 5. LoginForm — 登录弹窗（按需显示）
 */
const Home = () => {
  /** 控制 LoginForm 是否可见 */
  const [showLogin, setShowLogin] = useState(false);

  /** 打开登录弹窗 */
  const handleOpenLogin = useCallback(() => {
    setShowLogin(true);
  }, []);

  /** 关闭登录弹窗 */
  const handleCloseLogin = useCallback(() => {
    setShowLogin(false);
  }, []);

  return (
    <>
      {/* 顶部导航栏 */}
      <Header onLogin={handleOpenLogin} />

      {/* 首屏 — 背景大图 */}
      <HeroContent />

      {/* 关于我们 — 芒格头像 + 格言 + 公司介绍 */}
      <AboutSection />

      {/* 核心产品 + 合作伙伴 */}
      <ProductSection />

      {/* 登录表单弹窗 */}
      <LoginForm visible={showLogin} onClose={handleCloseLogin} />
    </>
  );
};

export default Home;
