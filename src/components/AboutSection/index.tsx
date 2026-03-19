'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AboutSection.module.css';

/**
 * 关于我们模块
 *
 * 功能：
 * - 大标题 + 描述文本居中展示
 * - 滚动到可见区域时触发入场动画（Intersection Observer）
 * - 风格与首屏 HeroContent 保持一致
 */
const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // 入场后不再监听，动画只触发一次
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* 装饰分割线 */}
      <div className={`${styles.divider} ${visible ? styles.dividerVisible : ''}`} />

      {/* 小标签 */}
      <div className={`${styles.tag} ${visible ? styles.tagVisible : ''}`}>
        About Us
      </div>

      {/* 大标题 */}
      <div className={`${styles.title} ${visible ? styles.titleVisible : ''}`}>
        關於我們
      </div>

      {/* 英文副标题 */}
      <div className={`${styles.subtitle} ${visible ? styles.subtitleVisible : ''}`}>
        AscenCloud Investment
      </div>

      {/* 描述文本 */}
      <div className={`${styles.description} ${visible ? styles.descriptionVisible : ''}`}>
        <p>
          出雲資本是一家立足全球視野的投資機構，致力於發掘並培育具有長期價值的優質企業。
          我們秉承「雲端之上，洞見未來」的理念，以深度研究驅動投資決策，
          為合作夥伴創造可持續的卓越回報。
        </p>
        <p>
          我們的團隊匯聚了來自金融、科技、產業等多領域的資深專家，
          憑藉獨到的行業洞察和嚴謹的風險管理體系，
          在瞬息萬變的市場中捕捉確定性機遇，助力企業實現跨越式成長。
        </p>
      </div>

      {/* 底部装饰点 */}
      <div className={`${styles.dot} ${visible ? styles.dotVisible : ''}`} />
    </section>
  );
};

export default AboutSection;
