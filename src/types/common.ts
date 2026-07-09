/** 下拉选项通用类型 */
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/** 树形节点通用类型 */
export interface TreeNode<T = string> {
  key: T;
  title: string;
  children?: TreeNode<T>[];
  /** 是否禁用选中 */
  disabled?: boolean;
  /** 附加数据 */
  extra?: Record<string, unknown>;
}

/** 状态枚举映射项 */
export interface StatusItem {
  label: string;
  value: string | number;
  color: string;           // 对应 Ant Design Tag 的 color
}

/** 表格筛选条件（键为字段名，值为筛选值数组） */
export type Filters = Record<string, (string | number)[] | null>;

/** 导入导出任务状态 */
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';