'use client';

import styles from './Header.module.css';

interface HeaderProps {
  /** 点击登录按钮回调 */
  onLogin: () => void;
}

/**
 * 顶部导航栏
 *
 * 桥水基金风格：
 * - 左侧：品牌名称 logo
 * - 右侧：登录入口
 * - 简洁水平线分割
 */
const Header = ({ onLogin }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 左侧 — Logo 区域 */}
        <div className={styles.logo}>
          <span className={styles.logoText}>出雲资本</span>
          <span className={styles.logoSub}>ASCENCLOUD</span>
        </div>

        {/* 右侧 — 登录入口 */}
        <button className={styles.loginBtn} onClick={onLogin}>
          客户专区
        </button>
      </div>
    </header>
  );
};

export default Header;
