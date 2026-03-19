/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = '/ascenCloudWebSite';

const nextConfig = {
  // 开启 React Strict Mode
  reactStrictMode: true,
  // 静态导出，用于 GitHub Pages 部署
  output: 'export',
  // GitHub Pages 部署基础路径（仓库名）
  basePath: isGitHubPages ? repoName : '',
  // 静态资源前缀
  assetPrefix: isGitHubPages ? `${repoName}/` : '',
  // 禁用图片优化（静态导出不支持）
  images: {
    unoptimized: true,
  },
  // 将 basePath 暴露给客户端组件
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? repoName : '',
  },
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
