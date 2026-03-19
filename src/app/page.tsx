import Home from '@/components/Home';

/**
 * 首页路由入口
 *
 * 业务逻辑与 UI 渲染委托给 Home 组件，
 * page.tsx 仅作为 Next.js App Router 的路由映射层。
 */
const Page = () => <Home />;

export default Page;
