'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
 * iOS 键盘适配策略：
 * 表单固定在距离顶部安全位置（CSS padding-top），
 * 键盘从底部弹起时不会影响表单位置，无需 JS 补偿。
 */
const LoginForm = ({ visible, onClose }: LoginFormProps) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** 表单提交 — 登录后跳转到 dashboard */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    setIsSubmitting(true);
    // TODO: 对接实际登录接口，目前模拟登录成功后直接跳转
    setTimeout(() => {
      setIsSubmitting(false);
      // 恢复 body 滚动
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      router.push('/dashboard');
    }, 1500);
  }, [username, password, router]);

  return (
    <div
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
