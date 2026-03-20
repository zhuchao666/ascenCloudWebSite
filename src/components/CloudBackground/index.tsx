'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  TextureLoader,
  Vector2,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Clock,
  LinearFilter,
  ClampToEdgeWrapping,
} from 'three';
import type { IUniform } from 'three';
import vertexShader from '@/shaders/cloud.vert';
import fragmentShader from '@/shaders/cloud.frag';
import useSmoothMouse from '@/hooks/useSmoothMouse';

/**
 * 云层背景组件 — Three.js + WebGL Shader 实现
 *
 * 功能：
 * 1. 全屏 bg.png 背景图渲染（cover 模式适配屏幕比例）
 * 2. 多层 Domain Warping 驱动云层涌动（呼吸节奏 + 多尺度噪声）
 * 3. 鼠标/触摸视差效果
 * 4. 云天分区差异化涌动强度
 */

// 鼠标视差强度常量
const PARALLAX_X = 0.015;
const PARALLAX_Y = 0.01;

// rendering-hoist-jsx: 静态样式提取到组件外部避免每次渲染重建
const canvasStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
};

interface CloudBackgroundProps {
  /** 纹理加载完成回调 */
  onTextureLoaded?: () => void;
  /** 是否暂停渲染（首屏淡出后暂停以节省 GPU 资源） */
  paused?: boolean;
}

const CloudBackground = ({ onTextureLoaded, paused = false }: CloudBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const uniformsRef = useRef<Record<string, IUniform> | null>(null);
  const clockRef = useRef<Clock | null>(null);
  const frameIdRef = useRef<number>(0);
  const pausedRef = useRef(paused);
  const animateRef = useRef<(() => void) | null>(null);
  const { update: updateMouse } = useSmoothMouse(0.03);

  // 用 ref 存储回调和函数引用，避免它们进入 useEffect 依赖数组导致 Three.js 场景重建
  const onTextureLoadedRef = useRef(onTextureLoaded);
  onTextureLoadedRef.current = onTextureLoaded;

  const updateMouseRef = useRef(updateMouse);
  updateMouseRef.current = updateMouse;

  // 同步 paused prop 到 ref
  pausedRef.current = paused;

  /**
   * 处理窗口 resize
   * 更新渲染器尺寸和 shader uniform
   */
  const handleResize = useCallback(() => {
    const renderer = rendererRef.current;
    const uniforms = uniformsRef.current;
    if (!renderer || !uniforms) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    uniforms.uResolution.value.set(w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ============================================
    // 初始化 Three.js 渲染器
    // ============================================
    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    rendererRef.current = renderer;

    // ============================================
    // 场景 & 正交相机（全屏平面）
    // ============================================
    const scene = new Scene();
    const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    // ============================================
    // Shader Uniforms
    // ============================================
    const uniforms: Record<string, IUniform> = {
      uTexture: { value: null },
      uTime: { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
      uResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
      uImgAspect: { value: 1.78 }, // 默认 16:9，纹理加载后更新
    };
    uniformsRef.current = uniforms;

    // ============================================
    // 加载背景纹理
    // ============================================
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load('/bg.png', (tex) => {
      uniforms.uImgAspect.value = tex.image.width / tex.image.height;
      onTextureLoadedRef.current?.();
    });
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    uniforms.uTexture.value = texture;

    // ============================================
    // 全屏 Plane + ShaderMaterial
    // ============================================
    const geometry = new PlaneGeometry(1, 1);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    // ============================================
    // 时钟
    // ============================================
    const clock = new Clock();
    clockRef.current = clock;

    // ============================================
    // 动画循环
    // ============================================
    const animate = () => {
      // 暂停时停止循环（恢复由 useEffect 重启）
      if (pausedRef.current) {
        frameIdRef.current = 0;
        return;
      }

      frameIdRef.current = requestAnimationFrame(animate);

      // 时间传入 shader（驱动云卷云舒）
      uniforms.uTime.value = clock.getElapsedTime();

      // 鼠标平滑 & 视差（通过 ref 引用，避免依赖变化）
      const mouse = updateMouseRef.current();
      uniforms.uMouse.value.set(
        (mouse.x - 0.5) * PARALLAX_X,
        -(mouse.y - 0.5) * PARALLAX_Y,
      );

      renderer.render(scene, camera);
    };

    // 保存 animate 引用供外部恢复调用
    animateRef.current = animate;
    animate();

    // ============================================
    // resize 监听
    // ============================================
    window.addEventListener('resize', handleResize);

    // ============================================
    // 清理
    // ============================================
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      rendererRef.current = null;
      uniformsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleResize]);

  /**
   * paused 变化时恢复动画循环
   * 从暂停恢复 → 重新启动 rAF 循环
   */
  useEffect(() => {
    if (!paused && animateRef.current && frameIdRef.current === 0) {
      animateRef.current();
    }
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      style={canvasStyle}
    />
  );
};

export default CloudBackground;
