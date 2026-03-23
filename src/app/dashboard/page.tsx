import type { Metadata } from 'next';
import FundDashboard from '@/components/FundDashboard';

export const metadata: Metadata = {
  title: '基金大盘',
  description: '出云资本基金大盘',
};

const DashboardPage = () => {
  return <FundDashboard />;
};

export default DashboardPage;
