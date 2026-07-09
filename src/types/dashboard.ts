/** 概览统计数据 */
export interface DashboardStats {
  totalUsers: number;
  todayTransactions: number;
  todayAmount: number;         // 单位：分
  pendingAudit: number;
  anomalyCount: number;
}

/** 趋势数据点 */
export interface TrendDataPoint {
  date: string;
  value: number;
}

/** 分类统计（饼图用） */
export interface CategoryStat {
  name: string;
  value: number;
}

/** 待办事项 */
export interface TodoItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  module: string;             // 所属模块名
}

/** Dashboard 完整数据 */
export interface DashboardData {
  stats: DashboardStats;
  transactionTrend: TrendDataPoint[];
  categoryDistribution: CategoryStat[];
  todos: TodoItem[];
}