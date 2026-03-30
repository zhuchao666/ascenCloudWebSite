'use client';

import { useState, useCallback } from 'react';
import styles from './index.module.css';
import AccountOverview from './AccountOverview';
import AccountCard from './AccountCard';
import HolderDrawer from './HolderDrawer';
import type { Holder } from './HolderDrawer';

/** 账户数据类型 */
interface Account {
  name: string;
  shortName: string;
  totalAsset: string;
  holdingPnl: string;
  holdingPnlPct: string;
  sparkData: number[];
  isPositive: boolean;
  isGroup: boolean;
  holders?: Holder[];
}

/** Mock 账户数据 */
const initialAccounts: Account[] = [
  {
    name: '稳健增长1号',
    shortName: '稳1',
    totalAsset: '¥463,572.00',
    holdingPnl: '+¥32,145.80',
    holdingPnlPct: '+7.46%',
    sparkData: [0.2, 0.25, 0.3, 0.28, 0.35, 0.4, 0.38, 0.45, 0.5, 0.55, 0.6, 0.58, 0.65, 0.7, 0.75],
    isPositive: true,
    isGroup: false,
  },
  {
    name: '价值精选2号',
    shortName: '价2',
    totalAsset: '¥328,910.50',
    holdingPnl: '-¥15,432.60',
    holdingPnlPct: '-4.49%',
    sparkData: [0.7, 0.68, 0.65, 0.6, 0.55, 0.58, 0.52, 0.48, 0.45, 0.42, 0.4, 0.38, 0.35, 0.33, 0.3],
    isPositive: false,
    isGroup: true,
    holders: [
      { name: '张三', ratio: 0.12, updatedAt: '2026-03-28 14:30' },
      { name: '李四', ratio: 0.10, updatedAt: '2026-03-27 09:15' },
      { name: '王五', ratio: 0.09, updatedAt: '2026-03-25 16:42' },
      { name: '赵六', ratio: 0.08, updatedAt: '2026-03-26 10:20' },
      { name: '孙七', ratio: 0.07, updatedAt: '2026-03-24 13:55' },
      { name: '周八', ratio: 0.07, updatedAt: '2026-03-23 17:30' },
      { name: '吴九', ratio: 0.06, updatedAt: '2026-03-22 08:10' },
      { name: '郑十', ratio: 0.06, updatedAt: '2026-03-21 15:45' },
      { name: '钱十一', ratio: 0.06, updatedAt: '2026-03-20 11:00' },
      { name: '刘十二', ratio: 0.05, updatedAt: '2026-03-19 09:30' },
      { name: '陈十三', ratio: 0.05, updatedAt: '2026-03-18 14:20' },
      { name: '杨十四', ratio: 0.05, updatedAt: '2026-03-17 16:10' },
      { name: '黄十五', ratio: 0.05, updatedAt: '2026-03-16 10:40' },
      { name: '林十六', ratio: 0.05, updatedAt: '2026-03-15 12:25' },
      { name: '何十七', ratio: 0.04, updatedAt: '2026-03-14 08:55' },
    ],
  },
  {
    name: '量化对冲3号',
    shortName: '量3',
    totalAsset: '¥256,780.35',
    holdingPnl: '+¥41,286.50',
    holdingPnlPct: '+19.16%',
    sparkData: [0.1, 0.15, 0.2, 0.25, 0.3, 0.28, 0.35, 0.42, 0.48, 0.55, 0.6, 0.65, 0.72, 0.78, 0.85],
    isPositive: true,
    isGroup: true,
    holders: [
      { name: '赵六', ratio: 0.50, updatedAt: '2026-03-29 10:00' },
      { name: '孙七', ratio: 0.30, updatedAt: '2026-03-28 11:20' },
      { name: '周八', ratio: 0.20, updatedAt: '2026-03-26 08:45' },
    ],
  },
  {
    name: '行业轮动4号',
    shortName: '行4',
    totalAsset: '¥236,367.60',
    holdingPnl: '+¥28,432.48',
    holdingPnlPct: '+13.68%',
    sparkData: [0.3, 0.32, 0.35, 0.4, 0.38, 0.42, 0.48, 0.52, 0.5, 0.55, 0.58, 0.62, 0.6, 0.65, 0.68],
    isPositive: true,
    isGroup: false,
  },
];

const AccountsDashboard = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  /** 当前打开抽屉的账户索引，null 表示关闭 */
  const [drawerIndex, setDrawerIndex] = useState<number | null>(null);

  /** 打开抽屉 */
  const handleOpenDrawer = useCallback((idx: number) => {
    setDrawerIndex(idx);
  }, []);

  /** 关闭抽屉 */
  const handleCloseDrawer = useCallback(() => {
    setDrawerIndex(null);
  }, []);

  /** 更新持有人列表 */
  const handleHoldersChange = useCallback(
    (newHolders: Holder[]) => {
      if (drawerIndex === null) return;
      setAccounts((prev) => {
        const updated = [...prev];
        updated[drawerIndex] = { ...updated[drawerIndex], holders: newHolders };
        return updated;
      });
    },
    [drawerIndex],
  );

  const activeAccount = drawerIndex !== null ? accounts[drawerIndex] : null;

  return (
    <div className={styles.container}>
      {/* 顶部大盘概览 */}
      <AccountOverview />

      {/* 账户列表标题 */}
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>账户列表</h3>
          <p className={styles.sectionSubtitle}>所有托管账户一览</p>
        </div>
        <span className={styles.accountCount}>共 {accounts.length} 个账户</span>
      </div>

      {/* 账户卡片网格 */}
      <div className={styles.cardGrid}>
        {accounts.map((account, idx) => (
          <AccountCard
            key={account.name}
            {...account}
            onGroupClick={() => handleOpenDrawer(idx)}
          />
        ))}
      </div>

      {/* 集合账户抽屉弹窗 */}
      {activeAccount && activeAccount.isGroup && (
        <HolderDrawer
          open={drawerIndex !== null}
          onClose={handleCloseDrawer}
          accountName={activeAccount.name}
          shortName={activeAccount.shortName}
          holders={activeAccount.holders || []}
          onHoldersChange={handleHoldersChange}
        />
      )}
    </div>
  );
};

export default AccountsDashboard;
