/**
 * 背景叠加层组件
 * 深色渐变遮罩，增强视觉层次感和文字可读性
 */

// rendering-hoist-jsx: 静态样式提取到模块级避免每次渲染重建
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `linear-gradient(180deg,
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.05) 60%,
    rgba(0, 0, 0, 0.4) 100%
  )`,
  zIndex: 1,
  pointerEvents: 'none',
};

const CloudOverlay = () => {
  return <div style={overlayStyle} />;
};

export default CloudOverlay;
