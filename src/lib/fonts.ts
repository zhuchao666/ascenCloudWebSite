import { Inter, Cormorant_Garamond, Noto_Serif_SC } from 'next/font/google';

/**
 * 字体配置 — 使用 next/font 自托管，零布局偏移
 *
 * 只在此文件中定义一次，通过 CSS 变量在全局使用
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
});
