'use client';

import { useState, useCallback, useMemo } from 'react';
import Drawer from 'rc-drawer';
import 'rc-drawer/assets/index.css';
import Table from 'rc-table';
import type { ColumnsType } from 'rc-table/lib/interface';
import 'rc-table/assets/index.css';
import styles from './ShareholderDrawer.module.css';
import type { Shareholder } from './index';

interface ShareholderDrawerProps {
  open: boolean;
  onClose: () => void;
  shareholders: Shareholder[];
  onShareholdersChange: (list: Shareholder[]) => void;
}

interface EditState {
  index: number;
  name: string;
  amount: string;
  nature: string;
  change: Shareholder['change'];
  changeAmount: string;
}

const getNow = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** SVG 图标 */
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TooltipButton = ({ tooltip, className, disabled, onClick, children }: {
  tooltip: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <span className={styles.tooltipWrapper}>
    <button type="button" className={className} onClick={onClick} disabled={disabled}>{children}</button>
    <span className={styles.tooltipText}>{tooltip}</span>
  </span>
);

interface TableRow {
  key: string;
  idx: number;
  name: string;
  amount: number;
  ratio: number;
  nature: string;
  change: Shareholder['change'];
  changeAmount: number;
  editing: boolean;
}

const CHANGE_OPTIONS: { value: Shareholder['change']; label: string }[] = [
  { value: 'increase', label: '增持' },
  { value: 'decrease', label: '减持' },
  { value: 'unchanged', label: '不变' },
  { value: 'new', label: '新进' },
];

const ShareholderDrawer = ({ open, onClose, shareholders, onShareholdersChange }: ShareholderDrawerProps) => {
  const [editState, setEditState] = useState<EditState | null>(null);
  const [searchText, setSearchText] = useState('');

  const handleAdd = useCallback(() => {
    setEditState({ index: -1, name: '', amount: '', nature: '国有法人', change: 'new', changeAmount: '0' });
  }, []);

  const handleEdit = useCallback((idx: number) => {
    const sh = shareholders[idx];
    setEditState({
      index: idx,
      name: sh.name,
      amount: String(sh.amount),
      nature: sh.nature,
      change: sh.change,
      changeAmount: String(sh.changeAmount),
    });
  }, [shareholders]);

  const handleSave = useCallback(() => {
    if (!editState) return;
    const trimmedName = editState.name.trim();
    const amountNum = Number(editState.amount);
    const changeAmountNum = Number(editState.changeAmount);
    if (!trimmedName || Number.isNaN(amountNum) || amountNum < 0) return;

    const updated = [...shareholders];
    const entry: Shareholder = {
      name: trimmedName,
      amount: amountNum,
      ratio: 0,
      nature: editState.nature,
      change: editState.change,
      changeAmount: Number.isNaN(changeAmountNum) ? 0 : changeAmountNum,
    };

    if (editState.index === -1) {
      updated.push(entry);
    } else {
      updated[editState.index] = entry;
    }

    // 重算比例
    const totalAmount = updated.reduce((sum, sh) => sum + sh.amount, 0);
    const recalculated = updated.map((sh) => ({
      ...sh,
      ratio: totalAmount > 0 ? sh.amount / totalAmount : 0,
    }));

    onShareholdersChange(recalculated);
    setEditState(null);
  }, [editState, shareholders, onShareholdersChange]);

  const handleCancel = useCallback(() => setEditState(null), []);

  const handleDelete = useCallback((idx: number) => {
    const updated = shareholders.filter((_, i) => i !== idx);
    // 重算比例
    const totalAmount = updated.reduce((sum, sh) => sum + sh.amount, 0);
    const recalculated = updated.map((sh) => ({
      ...sh,
      ratio: totalAmount > 0 ? sh.amount / totalAmount : 0,
    }));
    onShareholdersChange(recalculated);
    if (editState && editState.index === idx) setEditState(null);
  }, [shareholders, onShareholdersChange, editState]);

  const tableData: TableRow[] = useMemo(() => {
    const rows: TableRow[] = shareholders
      .map((sh, idx) => {
        const isEditing = editState && editState.index === idx;
        if (searchText && !isEditing && !sh.name.toLowerCase().includes(searchText.toLowerCase())) return null;
        return {
          key: `sh-${idx}`,
          idx,
          name: sh.name,
          amount: sh.amount,
          ratio: sh.ratio,
          nature: sh.nature,
          change: sh.change,
          changeAmount: sh.changeAmount,
          editing: !!(editState && editState.index === idx),
        };
      })
      .filter((r): r is TableRow => r !== null);

    if (editState && editState.index === -1) {
      rows.push({
        key: 'new-row',
        idx: -1,
        name: '',
        amount: 0,
        ratio: 0,
        nature: '',
        change: 'new',
        changeAmount: 0,
        editing: true,
      });
    }
    return rows;
  }, [shareholders, editState, searchText]);

  const columns: ColumnsType<TableRow> = useMemo(() => [
    {
      title: '股东名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: TableRow) => {
        if (record.editing && editState) {
          return (
            <input
              className={styles.editInput}
              value={editState.name}
              onChange={(e) => setEditState({ ...editState, name: e.target.value })}
              placeholder="股东名称"
              autoFocus
            />
          );
        }
        return record.name;
      },
    },
    {
      title: '持仓金额（万）',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      render: (_: number, record: TableRow) => {
        if (record.editing && editState) {
          return (
            <input
              className={`${styles.editInput} ${styles.numberInput}`}
              value={editState.amount}
              onChange={(e) => setEditState({ ...editState, amount: e.target.value })}
              placeholder="金额"
              type="number"
              min="0"
            />
          );
        }
        return <span className={styles.sharesCell}>{record.amount.toLocaleString('zh-CN')}</span>;
      },
    },
    {
      title: '占比',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 70,
      render: (_: number, record: TableRow) => (
        <span className={styles.ratioCell}>{(record.ratio * 100).toFixed(2)}%</span>
      ),
    },
    {
      title: '性质',
      dataIndex: 'nature',
      key: 'nature',
      width: 100,
      render: (_: string, record: TableRow) => {
        if (record.editing && editState) {
          return (
            <input
              className={styles.editInput}
              value={editState.nature}
              onChange={(e) => setEditState({ ...editState, nature: e.target.value })}
              placeholder="性质"
            />
          );
        }
        return <span className={styles.natureCell}>{record.nature}</span>;
      },
    },
    {
      title: '变动',
      dataIndex: 'change',
      key: 'change',
      width: 120,
      render: (_: string, record: TableRow) => {
        if (record.editing && editState) {
          return (
            <div className={styles.changeEditRow}>
              <select
                className={styles.editSelect}
                value={editState.change}
                onChange={(e) => setEditState({ ...editState, change: e.target.value as Shareholder['change'] })}
              >
                {CHANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {editState.change !== 'unchanged' && (
                <input
                  className={`${styles.editInput} ${styles.changeAmountInput}`}
                  value={editState.changeAmount}
                  onChange={(e) => setEditState({ ...editState, changeAmount: e.target.value })}
                  placeholder="数量"
                  type="number"
                  min="0"
                />
              )}
            </div>
          );
        }
        const text = record.change === 'new' ? '新进'
          : record.change === 'increase' ? `+${record.changeAmount}万`
            : record.change === 'decrease' ? `-${record.changeAmount}万`
              : '不变';
        const cls = (record.change === 'new' || record.change === 'increase')
          ? styles.changeUp
          : record.change === 'decrease' ? styles.changeDown : styles.changeNeutral;
        return <span className={cls}>{text}</span>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, record: TableRow) => {
        if (record.editing) {
          return (
            <div className={styles.actionsCell}>
              <TooltipButton tooltip="保存" className={`${styles.actionBtn} ${styles.saveBtn}`} onClick={handleSave}>
                <CheckIcon />
              </TooltipButton>
              <TooltipButton tooltip="取消" className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={handleCancel}>
                <CloseIcon />
              </TooltipButton>
            </div>
          );
        }
        return (
          <div className={styles.actionsCell}>
            <TooltipButton tooltip="编辑" className={styles.actionBtn} onClick={() => handleEdit(record.idx)} disabled={editState !== null}>
              <EditIcon />
            </TooltipButton>
            <TooltipButton tooltip="删除" className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(record.idx)} disabled={editState !== null}>
              <DeleteIcon />
            </TooltipButton>
          </div>
        );
      },
    },
  ], [editState, handleSave, handleCancel, handleEdit, handleDelete]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={720}
      maskClosable
      keyboard
      motion={{ motionName: 'drawer-slide', motionAppear: true, motionEnter: true, motionLeave: true }}
      maskMotion={{ motionName: 'drawer-mask', motionAppear: true, motionEnter: true, motionLeave: true }}
      styles={{ wrapper: { boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)' } }}
      rootClassName={styles.drawerRoot}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>股</div>
          <span className={styles.headerTitle}>十大股东管理</span>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="关闭">✕</button>
      </div>

      <div className={styles.body}>
        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <span className={styles.tableSectionTitle}>股东列表 ({shareholders.length})</span>
            <div className={styles.tableSectionActions}>
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  className={styles.searchInput}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="搜索股东..."
                />
                {searchText && (
                  <button type="button" className={styles.searchClear} onClick={() => setSearchText('')} aria-label="清空搜索">✕</button>
                )}
              </div>
              <TooltipButton tooltip="添加新的股东" className={styles.addBtn} onClick={handleAdd} disabled={editState !== null}>
                <span className={styles.addBtnIcon}>+</span>
                新增股东
              </TooltipButton>
            </div>
          </div>

          <Table
            className={styles.table}
            columns={columns}
            data={tableData}
            rowKey="key"
            emptyText={!editState ? <span className={styles.emptyText}>暂无股东，点击上方按钮新增</span> : null}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default ShareholderDrawer;
