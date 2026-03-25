import type { Metadata } from 'next';
import AccountsDashboard from '@/components/AccountsDashboard';

export const metadata: Metadata = {
  title: '账户账本',
  description: '出云资本账户账本',
};

const AccountsPage = () => {
  return <AccountsDashboard />;
};

export default AccountsPage;
