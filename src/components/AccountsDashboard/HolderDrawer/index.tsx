'use client';

import { useState, useCallback } from 'react';
import Drawer from 'rc-drawer';
import 'rc-drawer/assets/index.css';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from './index.module.css';

/** 持有人信息 */
export interface Holder {
  name: string;
  /** 持有比例，如 0.35 表示 35% */
  ratio: number;
  /** 更新时间 */
  updatedAt: string;
}

interface HolderDrawerProps {
  /** 是否打开抽屉 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 账户名称 */
  accountName: string;
  /** 账户简称 */
  shortName: string;
  /** 持有人列表 */
  holders: Holder[];
  /** 持有人变更回调 */
  onHoldersChange: (holders: Holder[]) => void;
}

/** 配色板（多彩方案，支持 20+ 位持有人，颜色区分度高） */
const PIE_COLORS = [
  '#b5a162', // 金色（品牌主色）
  '#5b8def', // 蓝色
  '#e8734a', // 橙红
  '#50c48a', // 翠绿
  '#a855f7', // 紫色
  '#f59e0b', // 琥珀
  '#ec4899', // 粉红
  '#14b8a6', // 青色
  '#8b5cf6', // 靛蓝
  '#ef4444', // 红色
  '#06b6d4', // 天蓝
  '#84cc16', // 青柠
  '#f97316', // 橙色
  '#6366f1', // 蓝紫
  '#10b981', // 绿松石
  '#d946ef', // 品红
  '#0ea5e9', // 浅蓝
  '#eab308', // 黄色
  '#64748b', // 石板灰
  '#e11d48', // 玫红
];

/** SVG 图标：编辑（铅笔） */
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

/** SVG 图标：删除（垃圾桶） */
const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/** SVG 图标：保存（对勾） */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** SVG 图标：取消（叉号） */
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/** 自定义 Tooltip 按钮包装 */
const TooltipButton = ({
  tooltip,
  className,
  disabled,
  onClick,
  children,
}: {
  tooltip: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <span className={styles.tooltipWrapper}>
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
    <span className={styles.tooltipText}>{tooltip}</span>
  </span>
);

/** 编辑行状态 */
interface EditState {
  /** -1 表示新增行, >=0 表示正在编辑的行索引 */
  index: number;
  name: string;
  ratio: string;
}

/**
 * 获取当前时间的格式化字符串 YYYY-MM-DD HH:mm
 */
const getNow = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * 自定义饼图 Tooltip
 */
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0];
    return (
      <div className={styles.chartTooltip}>
        <span
          className={styles.tooltipDot}
          style={{ backgroundColor: item.payload.fill }}
        />
        <span className={styles.tooltipName}>{item.name}</span>
        <span className={styles.tooltipValue}>{item.value}%</span>
      </div>
    );
  }
  return null;
};

/**
 * 自定义饼图图例
 */
const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null;
  return (
    <div className={styles.legend}>
      {payload.map((entry) => (
        <div key={entry.value} className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ backgroundColor: entry.color }}
          />
          <span className={styles.legendName}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const HolderDrawer = ({
  open,
  onClose,
  accountName,
  shortName,
  holders,
  onHoldersChange,
}: HolderDrawerProps) => {
  const [editState, setEditState] = useState<EditState | null>(null);
  const [searchText, setSearchText] = useState('');

  /** 开始新增 */
  const handleAdd = useCallback(() => {
    setEditState({ index: -1, name: '', ratio: '' });
  }, []);

  /** 开始编辑 */
  const handleEdit = useCallback(
    (idx: number) => {
      const h = holders[idx];
      setEditState({
        index: idx,
        name: h.name,
        ratio: (h.ratio * 100).toFixed(0),
      });
    },
    [holders],
  );

  /** 保存（新增 / 编辑） */
  const handleSave = useCallback(() => {
    if (!editState) return;

    const trimmedName = editState.name.trim();
    const ratioNum = Number(editState.ratio);
    if (!trimmedName || Number.isNaN(ratioNum) || ratioNum <= 0 || ratioNum > 100) return;

    const updated = [...holders];
    const newHolder: Holder = {
      name: trimmedName,
      ratio: ratioNum / 100,
      updatedAt: getNow(),
    };

    if (editState.index === -1) {
      updated.push(newHolder);
    } else {
      updated[editState.index] = newHolder;
    }

    onHoldersChange(updated);
    setEditState(null);
  }, [editState, holders, onHoldersChange]);

  /** 取消编辑 */
  const handleCancel = useCallback(() => {
    setEditState(null);
  }, []);

  /** 删除持有人 */
  const handleDelete = useCallback(
    (idx: number) => {
      const updated = holders.filter((_, i) => i !== idx);
      onHoldersChange(updated);
      // 如果正在编辑被删除的行，取消编辑
      if (editState && editState.index === idx) {
        setEditState(null);
      }
    },
    [holders, onHoldersChange, editState],
  );

  // ===== 饼图数据 =====
  const pieData = holders.map((h) => ({
    name: h.name,
    value: Number((h.ratio * 100).toFixed(1)),
  }));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={620}
      maskClosable
      keyboard
      motion={{
        motionName: 'drawer-slide',
        motionAppear: true,
        motionEnter: true,
        motionLeave: true,
      }}
      maskMotion={{
        motionName: 'drawer-mask',
        motionAppear: true,
        motionEnter: true,
        motionLeave: true,
      }}
      styles={{
        wrapper: {
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
        },
      }}
      rootClassName={styles.drawerRoot}
    >
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.accountIcon}>{shortName}</div>
          <span className={styles.headerTitle}>{accountName}</span>
          <span className={styles.headerTag}>集合</span>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* 内容区 */}
      <div className={styles.body}>
        {/* 饼图区域 */}
        <div className={styles.pieSection}>
          <span className={styles.pieSectionTitle}>持有人比例</span>

          <div className={styles.pieContainer}>
            <PieChart width={360} height={240}>
              <Pie
                data={pieData}
                cx={180}
                cy={120}
                innerRadius={65}
                outerRadius={105}
                paddingAngle={2}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
                animationBegin={0}
                animationDuration={600}
              >
                {pieData.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={PIE_COLORS[idx % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
            </PieChart>

            {/* 中心标签 */}
            <div className={styles.pieCenterLabel}>
              <div className={styles.pieCenterCount}>{holders.length}</div>
              <div className={styles.pieCenterText}>持有人</div>
            </div>
          </div>

          {/* 图例放在 PieChart 外部，独立布局避免重叠 */}
          <CustomLegend
            payload={pieData.map((item, idx) => ({
              value: item.name,
              color: PIE_COLORS[idx % PIE_COLORS.length],
            }))}
          />
        </div>

        {/* 表格区域 */}
        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <span className={styles.tableSectionTitle}>持有人管理</span>
            <div className={styles.tableSectionActions}>
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  className={styles.searchInput}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="搜索持有人..."
                />
                {searchText && (
                  <button
                    type="button"
                    className={styles.searchClear}
                    onClick={() => setSearchText('')}
                    aria-label="清空搜索"
                  >
                    ✕
                  </button>
                )}
              </div>
              <TooltipButton
                tooltip="添加新的持有人"
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={editState !== null}
              >
                <span className={styles.addBtnIcon}>+</span>
                新增持有人
              </TooltipButton>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>姓名</th>
                <th>比例</th>
                <th>更新时间</th>
                <th style={{ textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {holders.map((h, idx) => {
                // 搜索过滤：如果有搜索文本，隐藏不匹配的行（编辑行除外）
                const isEditing = editState && editState.index === idx;
                if (
                  searchText
                  && !isEditing
                  && !h.name.toLowerCase().includes(searchText.toLowerCase())
                ) {
                  return null;
                }
                // 编辑态
                if (editState && editState.index === idx) {
                  return (
                    <tr key={`edit-${idx}`}>
                      <td>
                        <input
                          className={styles.editInput}
                          value={editState.name}
                          onChange={(e) =>
                            setEditState({ ...editState, name: e.target.value })
                          }
                          placeholder="姓名"
                          autoFocus
                        />
                      </td>
                      <td>
                        <input
                          className={`${styles.editInput} ${styles.ratioInput}`}
                          value={editState.ratio}
                          onChange={(e) =>
                            setEditState({ ...editState, ratio: e.target.value })
                          }
                          placeholder="%"
                          type="number"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className={styles.timeCell}>-</td>
                      <td className={styles.actionsCell}>
                        <TooltipButton
                          tooltip="保存"
                          className={`${styles.actionBtn} ${styles.saveBtn}`}
                          onClick={handleSave}
                        >
                          <CheckIcon />
                        </TooltipButton>
                        <TooltipButton
                          tooltip="取消"
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={handleCancel}
                        >
                          <CloseIcon />
                        </TooltipButton>
                      </td>
                    </tr>
                  );
                }

                // 展示态
                return (
                  <tr key={h.name}>
                    <td>
                      <div className={styles.nameCell}>
                        <span
                          className={styles.holderDot}
                          style={{
                            backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                          }}
                        />
                        {h.name}
                      </div>
                    </td>
                    <td className={styles.ratioCell}>
                      {(h.ratio * 100).toFixed(0)}%
                    </td>
                    <td className={styles.timeCell}>{h.updatedAt}</td>
                    <td className={styles.actionsCell}>
                      <TooltipButton
                        tooltip="编辑"
                        className={styles.actionBtn}
                        onClick={() => handleEdit(idx)}
                        disabled={editState !== null}
                      >
                        <EditIcon />
                      </TooltipButton>
                      <TooltipButton
                        tooltip="删除"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(idx)}
                        disabled={editState !== null}
                      >
                        <DeleteIcon />
                      </TooltipButton>
                    </td>
                  </tr>
                );
              })}

              {/* 新增行 */}
              {editState && editState.index === -1 && (
                <tr>
                  <td>
                    <input
                      className={styles.editInput}
                      value={editState.name}
                      onChange={(e) =>
                        setEditState({ ...editState, name: e.target.value })
                      }
                      placeholder="姓名"
                      autoFocus
                    />
                  </td>
                  <td>
                    <input
                      className={`${styles.editInput} ${styles.ratioInput}`}
                      value={editState.ratio}
                      onChange={(e) =>
                        setEditState({ ...editState, ratio: e.target.value })
                      }
                      placeholder="%"
                      type="number"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className={styles.timeCell}>-</td>
                  <td className={styles.actionsCell}>
                    <TooltipButton
                      tooltip="保存"
                      className={`${styles.actionBtn} ${styles.saveBtn}`}
                      onClick={handleSave}
                    >
                      <CheckIcon />
                    </TooltipButton>
                    <TooltipButton
                      tooltip="取消"
                      className={`${styles.actionBtn} ${styles.cancelBtn}`}
                      onClick={handleCancel}
                    >
                      <CloseIcon />
                    </TooltipButton>
                  </td>
                </tr>
              )}

              {/* 空状态 */}
              {holders.length === 0 && !editState && (
                <tr className={styles.emptyRow}>
                  <td colSpan={4}>暂无持有人，点击上方按钮新增</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
};

export default HolderDrawer;
