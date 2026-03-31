'use client';

import { useState, useCallback, useMemo } from 'react';
import Table from 'rc-table';
import type { ColumnsType } from 'rc-table/lib/interface';
import 'rc-table/assets/index.css';
import styles from './index.module.css';
import ShareholderDrawer from './ShareholderDrawer';
import ProgressBar from '../../ProgressBar';

export interface Shareholder {
  name: string;
  amount: number; // 持仓金额（万元）
  ratio: number;
  nature: string;
  change: 'increase' | 'decrease' | 'unchanged' | 'new';
  changeAmount: number;
}

// 总资金（万元）
const TOTAL_FUND = 382600;

const DEFAULT_SHAREHOLDERS: Shareholder[] = [
  { name: '中国证券金融股份有限公司', amount: 58200, ratio: 0.152, nature: '国有法人', change: 'increase', changeAmount: 3200 },
  { name: '香港中央结算有限公司', amount: 42100, ratio: 0.110, nature: '境外法人', change: 'decrease', changeAmount: 1500 },
  { name: '中央汇金投资有限责任公司', amount: 38500, ratio: 0.101, nature: '国有法人', change: 'unchanged', changeAmount: 0 },
  { name: '全国社会保障基金理事会', amount: 29600, ratio: 0.077, nature: '国有法人', change: 'increase', changeAmount: 1800 },
  { name: '中国人寿保险股份有限公司', amount: 23400, ratio: 0.061, nature: '国有法人', change: 'new', changeAmount: 23400 },
  { name: '招商银行股份有限公司', amount: 18200, ratio: 0.048, nature: '国有法人', change: 'decrease', changeAmount: 900 },
  { name: '中国工商银行股份有限公司', amount: 16500, ratio: 0.043, nature: '国有法人', change: 'increase', changeAmount: 450 },
  { name: '中国建设银行股份有限公司', amount: 12800, ratio: 0.033, nature: '国有法人', change: 'unchanged', changeAmount: 0 },
  { name: '华夏基金管理有限公司', amount: 9800, ratio: 0.026, nature: '基金', change: 'increase', changeAmount: 2100 },
  { name: '易方达基金管理有限公司', amount: 8600, ratio: 0.022, nature: '基金', change: 'decrease', changeAmount: 650 },
];

const COLORS = [
  '#b5a162', '#5b8def', '#e8734a', '#50c48a', '#a855f7',
  '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#ef4444',
];

const formatAmount = (v: number): string => {
  if (v >= 10000) return `${(v / 10000).toFixed(2)}亿`;
  return `${v.toLocaleString('zh-CN')}万`;
};

const getChangeText = (sh: Shareholder): string => {
  if (sh.change === 'new') return '新进';
  if (sh.change === 'increase') return `+${sh.changeAmount.toLocaleString('zh-CN')}万`;
  if (sh.change === 'decrease') return `-${sh.changeAmount.toLocaleString('zh-CN')}万`;
  return '不变';
};

const getChangeClass = (change: Shareholder['change']): string => {
  if (change === 'new' || change === 'increase') return styles.changeUp;
  if (change === 'decrease') return styles.changeDown;
  return styles.changeNeutral;
};

type RowType = Shareholder & { _index: number };

const columns: ColumnsType<RowType> = [
  {
    title: '股东名称',
    dataIndex: 'name',
    key: 'name',
    render: (_: string, record: RowType) => (
      <div className={styles.nameCell}>
        <div className={styles.dot} style={{ background: COLORS[record._index % COLORS.length] }} />
        <span className={styles.nameText}>{record.name}</span>
      </div>
    ),
  },
  {
    title: '持仓金额',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right' as const,
    render: (v: number) => <span className={styles.tdBold}>{formatAmount(v)}</span>,
  },
  {
    title: '占比',
    dataIndex: 'ratio',
    key: 'ratio',
    align: 'right' as const,
    render: (v: number) => <span className={styles.tdBold}>{(v * 100).toFixed(2)}%</span>,
  },
  {
    title: '变动',
    dataIndex: 'change',
    key: 'change',
    align: 'right' as const,
    render: (_: string, record: RowType) => (
      <span className={getChangeClass(record.change)}>{getChangeText(record)}</span>
    ),
  },
];

const TopShareholders = () => {
  const [shareholders, setShareholders] = useState<Shareholder[]>(DEFAULT_SHAREHOLDERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpen = useCallback(() => setDrawerOpen(true), []);
  const handleClose = useCallback(() => setDrawerOpen(false), []);

  const tableData: RowType[] = shareholders.map((sh, idx) => ({
    ...sh,
    _index: idx,
  }));

  const totalAmount = useMemo(
    () => shareholders.reduce((sum, sh) => sum + sh.amount, 0),
    [shareholders],
  );

  const fundRatio = TOTAL_FUND > 0 ? totalAmount / TOTAL_FUND : 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>十大股东</h3>
          <p className={styles.subtitle}>
            当前十大股东持股详情
            <span className={styles.updateTime}> · 更新于 2026年3月23日</span>
          </p>
        </div>
        <button type="button" className={styles.editBtn} onClick={handleOpen}>
          编辑
        </button>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>十大股东持仓合计</span>
          <span className={styles.summaryValue}>{formatAmount(totalAmount)}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>总资金占比</span>
          <span className={styles.summaryValue}>{(fundRatio * 100).toFixed(2)}%</span>
          <ProgressBar value={fundRatio * 100} height={6} className={styles.summaryProgress} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <Table
          className={styles.table}
          columns={columns}
          data={tableData}
          rowKey="_index"
        />
      </div>

      <ShareholderDrawer
        open={drawerOpen}
        onClose={handleClose}
        shareholders={shareholders}
        onShareholdersChange={setShareholders}
      />
    </div>
  );
};

export default TopShareholders;
