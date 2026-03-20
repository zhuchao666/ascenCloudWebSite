/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启 React Strict Mode
  reactStrictMode: true,
  // webpack 配置：支持 GLSL shader 文件以 raw 字符串导入
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
