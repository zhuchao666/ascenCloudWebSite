'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './BottomFog.module.css';

/**
 * 底部云雾组件 — Canvas 2D 程序化粒子系统
 *
 * 功能：
 * 1. 预生成多张不同形态的云雾纹理（径向渐变叠加，打破圆形对称）
 * 2. 粒子从底部向上飘动 + 水平漂移 + 缓慢放大（模拟向用户飘来）
 * 3. 透明度生命周期：淡入 → 保持 → 淡出
 * 4. CSS mask 顶部淡出，与背景自然融合
 */

// =========================================
// 类型定义
// =========================================
interface FogParticle {
  tex: number;          // 纹理索引
  x: number;            // 水平位置
  y: number;            // 垂直位置
  size: number;         // 当前尺寸
  startSize: number;    // 初始尺寸
  vy: number;           // 垂直速度（向上为负）
  vx: number;           // 水平速度（向右为正）
  scale: number;        // 缩放系数
  scaleSpeed: number;   // 缩放速度
  opacity: number;      // 当前透明度
  maxOpacity: number;   // 最大透明度
  age: number;          // 当前年龄（ms）
  lifetime: number;     // 总生命周期（ms）
  forceBottom: boolean; // 是否强制从底部生成
}

// =========================================
// 常量
// =========================================
const MAX_FOG_PARTICLES = 14;
const TEXTURE_COUNT = 6;
const TEXTURE_SIZE = 256;

/**
 * 离屏生成柔和云雾纹理
 * 使用三层径向渐变叠加，打破圆形对称，产生不规则的云雾形态
 */
const createFogTexture = (size: number, seed: number): HTMLCanvasElement => {
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return offscreen;

  // --- 第1层: 基础径向渐变 ---
  const cx = size * (0.4 + seed * 0.2);
  const cy = size * (0.4 + ((seed * 7.3) % 1) * 0.2);
  const r = size * (0.35 + ((seed * 3.7) % 1) * 0.15);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // --- 第2层: 偏移渐变 — 打破圆形对称 ---
  const cx2 = size * (0.55 + ((seed * 5.1) % 1) * 0.25);
  const cy2 = size * (0.35 + ((seed * 2.9) % 1) * 0.3);
  const r2 = size * (0.25 + ((seed * 4.3) % 1) * 0.15);

  const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
  grad2.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  grad2.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
  grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, size, size);

  // --- 第3层: 小渐变 — 更多不规则感 ---
  const cx3 = size * (0.3 + ((seed * 9.7) % 1) * 0.4);
  const cy3 = size * (0.5 + ((seed * 6.1) % 1) * 0.2);
  const r3 = size * (0.15 + ((seed * 8.3) % 1) * 0.12);

  const grad3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, r3);
  grad3.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  grad3.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
  grad3.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad3;
  ctx.fillRect(0, 0, size, size);

  return offscreen;
};

/**
 * 创建一个云雾粒子
 * @param forceBottom 是否强制从底部生成（重生时为 true）
 */
const createFogParticle = (
  containerWidth: number,
  containerHeight: number,
  textureCount: number,
  forceBottom = false,
): FogParticle => {
  const texIdx = Math.floor(Math.random() * textureCount);
  const baseSize = containerWidth * (0.3 + Math.random() * 0.4);

  return {
    tex: texIdx,
    x: Math.random() * containerWidth * 1.2 - containerWidth * 0.1,
    y: forceBottom
      ? containerHeight * (0.7 + Math.random() * 0.4)
      : containerHeight * (0.2 + Math.random() * 0.8),
    size: baseSize,
    startSize: baseSize,
    vy: -(0.12 + Math.random() * 0.2),
    vx: 0.15 + Math.random() * 0.2,
    scale: 0.6 + Math.random() * 0.3,
    scaleSpeed: 0.0003 + Math.random() * 0.0004,
    opacity: 0,
    maxOpacity: 0.06 + Math.random() * 0.1,
    age: 0,
    lifetime: 18000 + Math.random() * 16000,
    forceBottom,
  };
};

const BottomFog = ({ paused = false }: { paused?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const texturesRef = useRef<HTMLCanvasElement[]>([]);
  const particlesRef = useRef<FogParticle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);
  const fogScaleRef = useRef<number>(1);
  const pausedRef = useRef(paused);
  const animateRef = useRef<((now: number) => void) | null>(null);

  // 同步 paused prop 到 ref
  pausedRef.current = paused;

  /**
   * 初始化并 resize 雾化 canvas 的尺寸（高 DPI 适配）
   */
  const resizeFogCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio, 2);
    fogScaleRef.current = scale;

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ============================================
    // 预生成云雾纹理
    // ============================================
    const textures: HTMLCanvasElement[] = [];
    for (let i = 0; i < TEXTURE_COUNT; i++) {
      textures.push(createFogTexture(TEXTURE_SIZE, (i + 1) * 0.137));
    }
    texturesRef.current = textures;

    // ============================================
    // 初始化粒子
    // ============================================
    resizeFogCanvas();

    const rect = container.getBoundingClientRect();
    const particles: FogParticle[] = [];

    for (let i = 0; i < MAX_FOG_PARTICLES; i++) {
      const p = createFogParticle(rect.width, rect.height, TEXTURE_COUNT, false);
      // 随机初始年龄，避免同时出现
      p.age = Math.random() * p.lifetime * 0.6;
      particles.push(p);
    }
    particlesRef.current = particles;

    lastTimeRef.current = performance.now();

    // ============================================
    // 动画循环
    // ============================================
    const animate = (now: number) => {
      // 暂停时停止循环（恢复由 useEffect 重启）
      if (pausedRef.current) {
        frameIdRef.current = 0;
        return;
      }

      frameIdRef.current = requestAnimationFrame(animate);

      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const containerRect = container.getBoundingClientRect();
      const w = containerRect.width;
      const h = containerRect.height;
      const scale = fogScaleRef.current;

      // 清空画布
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const currentParticles = particlesRef.current;

      for (let i = 0; i < currentParticles.length; i++) {
        const p = currentParticles[i];
        p.age += dt;

        // 生命周期进度
        const lifeProgress = p.age / p.lifetime;

        if (lifeProgress >= 1) {
          // 重生
          currentParticles[i] = createFogParticle(w, h, textures.length, true);
          continue;
        }

        // 移动
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;

        // 缓慢放大
        p.scale += p.scaleSpeed * dt;

        // 透明度：淡入(0~15%) → 保持(15~65%) → 淡出(65~100%)
        let opacity = 0;
        if (lifeProgress < 0.15) {
          opacity = p.maxOpacity * (lifeProgress / 0.15);
        } else if (lifeProgress < 0.65) {
          opacity = p.maxOpacity;
        } else {
          opacity = p.maxOpacity * (1 - (lifeProgress - 0.65) / 0.35);
        }

        if (opacity <= 0.001) continue;

        const drawSize = p.startSize * p.scale;

        ctx.globalAlpha = Math.max(0, opacity);
        ctx.drawImage(
          textures[p.tex],
          p.x - drawSize * 0.5,
          p.y - drawSize * 0.5,
          drawSize,
          drawSize,
        );
      }

      ctx.globalAlpha = 1;
    };

    // 保存 animate 引用供暂停恢复调用
    animateRef.current = animate;
    frameIdRef.current = requestAnimationFrame(animate);

    // ============================================
    // resize 监听
    // ============================================
    window.addEventListener('resize', resizeFogCanvas);

    // ============================================
    // 清理
    // ============================================
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', resizeFogCanvas);
    };
  }, [resizeFogCanvas]);

  /**
   * paused 变化时恢复动画循环
   */
  useEffect(() => {
    if (!paused && animateRef.current && frameIdRef.current === 0) {
      lastTimeRef.current = performance.now();
      frameIdRef.current = requestAnimationFrame(animateRef.current);
    }
  }, [paused]);

  return (
    <div ref={containerRef} className={styles.bottomFog}>
      <canvas ref={canvasRef} className={styles.fogCanvas} />
    </div>
  );
};

export default BottomFog;
