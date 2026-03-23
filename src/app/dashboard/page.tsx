import type { Metadata } from 'next';
import FundDashboard from '@/components/FundDashboard';

export const metadata: Metadata = {
  title: 'Fund Dashboard',
  description: 'AscenCloud Fund Dashboard — Portfolio Overview',
};

const DashboardPage = () => {
  return <FundDashboard />;
};

export default DashboardPage;
