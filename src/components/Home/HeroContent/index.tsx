'use client';

import styles from './HeroContent.module.css';

/**
 * 首页首屏 — 左侧格言 + 右侧背景大图
 *
 * 参考桥水基金布局，左侧展示基金核心理念/格言，右侧展示背景图
 */
const HeroContent = () => {
  return (
    <div className={styles.heroWrapper}>
      <section className={styles.bgSection}>
        <div className={styles.bannerCard}>
          {/* 左侧格言区域 */}
          <div className={styles.mottoArea}>
            <h2 className={styles.mottoTitle}>拨云见日，洞见未来</h2>
            <p className={styles.mottoText}>
              出雲资本秉承价值投资理念，以深度研究驱动投资决策，致力于发掘并培育具有长期价值的优质企业，为合作伙伴创造可持续的卓越回报。
            </p>
            <p className={styles.mottoText}>
              我们相信，真正的投资智慧在于穿越周期的迷雾，以理性与耐心捕捉时代赋予的确定性机遇。
            </p>
          </div>

          {/* 右侧背景图 */}
          <div className={styles.bgImageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bg.jpg"
              alt="出雲资本"
              className={styles.bgImage}
              loading="eager"
            />
            <div className={styles.bgOverlay} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroContent;
