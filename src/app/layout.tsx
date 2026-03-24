import type { Metadata, Viewport } from 'next';
import { inter, cormorantGaramond, notoSerifSC } from '@/lib/fonts';
import './globals.css';

/**
 * 根布局 — Next.js App Router
 *
 * - 使用 next/font 自托管字体，零布局偏移
 * - 通过 CSS 变量注入字体，供全局 CSS 使用
 * - 设置页面 <html> 语言为中文
 * - 提供 metadata（SEO、标题等）
 */
export const metadata: Metadata = {
  title: {
    default: '出雲资本',
    template: '%s | 出雲资本',
  },
  description: 'AscenCloud Investment',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f8f7f5',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${cormorantGaramond.variable} ${notoSerifSC.variable}`}
    >
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
