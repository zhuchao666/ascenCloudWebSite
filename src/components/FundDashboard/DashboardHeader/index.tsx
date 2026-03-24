'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './index.module.css';

const navItems = [
  { label: '持仓大盘', href: '/dashboard' },
  { label: '账户账本', href: '/accounts' },
];

const DashboardHeader = () => {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Left: Logo */}
        <Link href="/" className={styles.logo}>
          <LogoIcon />
          <span className={styles.logoText}>出雲资本</span>
        </Link>

        {/* Center: Nav */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: User info */}
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>JD</span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>John Doe</span>
            <ChevronDownIcon />
          </div>
        </div>
      </div>
    </header>
  );
};

const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
    <path
      d="M8 19L14 9L20 19H8Z"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M11 19L14 13.5L17 19"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
        <stop offset="0%" stopColor="#b5a162" />
        <stop offset="100%" stopColor="#c4b070" />
      </linearGradient>
    </defs>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.5 5.25L7 8.75L10.5 5.25"
      stroke="#6a7282"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default DashboardHeader;
