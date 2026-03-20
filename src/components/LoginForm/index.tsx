'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  /** 是否可见（控制入场动画） */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose?: () => void;
}

/**
 * 登录表单组件
 *
 * 包含：
 * - 表单标题
 * - 用户名输入框
 * - 密码输入框
 * - 登录按钮
 *
 * 风格与 HeroContent 保持一致：
 * 半透明玻璃质感、白色文字、细线边框
 *
 * iOS 键盘适配：
 * - 使用 visualViewport API 监听键盘弹起/收回
 * - 实时计算 offsetTop 补偿，防止 fixed 容器被键盘顶出空白
 */
const LoginForm = ({ visible, onClose }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * iOS 键盘弹起补偿
   *
   * 原理：iOS Safari 键盘弹起时，layout viewport 高度不变但 visual viewport 会缩小，
   * 并且 visualViewport.offsetTop > 0（页面被向上推了一段距离）。
   * 我们通过 translateY 把容器推回正确位置，消除空白。
   */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onViewportChange = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // offsetTop 表示 visual viewport 相对 layout viewport 的偏移
      // 键盘弹起时 offsetTop > 0，我们需要反向补偿
      const offsetTop = vv.offsetTop;
      const heightDiff = window.innerHeight - vv.height;

      if (heightDiff > 100) {
        // 键盘已弹起：固定容器高度为可视区域高度，并向下偏移补偿
        wrapper.style.height = `${vv.height}px`;
        // 需要保持 visible 状态的 translateY(0) 基础上追加键盘补偿
        wrapper.style.transform = visible
          ? `translateY(${offsetTop}px)`
          : `translateY(100%)`;
      } else {
        // 键盘已收回：清除内联 style，让 CSS 类接管
        wrapper.style.height = '';
        wrapper.style.transform = '';
      }
    };

    vv.addEventListener('resize', onViewportChange);
    vv.addEventListener('scroll', onViewportChange);

    return () => {
      vv.removeEventListener('resize', onViewportChange);
      vv.removeEventListener('scroll', onViewportChange);
    };
  }, [visible]);

  /**
   * 输入框获焦时，阻止 iOS 自动滚动行为
   */
  const handleFocus = useCallback(() => {
    // 强制锁定滚动位置
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, []);

  /** 表单提交 */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    setIsSubmitting(true);
    // TODO: 对接实际登录接口
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  }, [username, password]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.formWrapper} ${visible ? styles.formVisible : ''}`}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 右上角关闭按钮 */}
        {onClose && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        )}

        {/* 表单标题 */}
        <div className={styles.formTitle}>Welcome Back</div>
        <div className={styles.formSubtitle}>登录您的账户</div>

        {/* 用户名 */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="username">
            用户名
          </label>
          <input
            id="username"
            className={styles.input}
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={handleFocus}
            autoComplete="username"
          />
        </div>

        {/* 密码 */}
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">
            密码
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handleFocus}
            autoComplete="current-password"
          />
        </div>

        {/* 登录按钮 */}
        <button
          className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ''}`}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '登录中...' : '登 录'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
