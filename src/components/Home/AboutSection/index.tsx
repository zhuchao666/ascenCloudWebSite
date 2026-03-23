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
        关于我们
      </div>

      {/* 英文副标题 */}
      <div className={`${styles.subtitle} ${visible ? styles.subtitleVisible : ''}`}>
        AscenCloud Investment
      </div>

      {/* 描述文本 */}
      <div className={`${styles.description} ${visible ? styles.descriptionVisible : ''}`}>
        <p>
          出雲资本是一家立足全球视野的投资机构，致力于发掘并培育具有长期价值的优质企业。
          我们秉承「拨云见日，洞见未来」的理念，以深度研究驱动投资决策，
          为合作伙伴创造可持续的卓越回报。
        </p>
        <p>
          我们的团队汇聚了来自金融、科技、产业等多领域的资深专家，
          凭借独到的行业洞察和严谨的风险管理体系，
          在瞬息万变的市场中捕捉确定性机遇，助力企业实现跨越式成长。
        </p>
      </div>

      {/* 底部装饰点 */}
      <div className={`${styles.dot} ${visible ? styles.dotVisible : ''}`} />
    </section>
  );
};

export default AboutSection;
