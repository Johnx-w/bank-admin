/**
 * 仪表盘 Mock 数据
 *
 * 提供首页概览用的统计数据、趋势图和待办事项。
 * 可扩展点：调整各数组长度或数值来模拟不同场景。
 */
import type { DashboardData } from "../../types/dashboard";

/** Mock 仪表盘完整数据 */
export const MOCK_DASHBOARD: DashboardData = {
  stats: {
    totalUsers: 128,
    todayTransactions: 356,
    todayAmount: 12856700,  // ¥128,567.00
    pendingAudit: 23,
    anomalyCount: 3,
  },
  transactionTrend: [
    { date: "07-03", value: 120 },
    { date: "07-04", value: 85 },
    { date: "07-05", value: 210 },
    { date: "07-06", value: 156 },
    { date: "07-07", value: 198 },
    { date: "07-08", value: 267 },
    { date: "07-09", value: 356 },
  ],
  categoryDistribution: [
    { name: "转账", value: 45 },
    { name: "消费", value: 28 },
    { name: "充值", value: 15 },
    { name: "提现", value: 8 },
    { name: "其他", value: 4 },
  ],
  todos: [
    { id: "t01", title: "审核待处理交易 23 笔", priority: "high", deadline: "今天 18:00", module: "交易管理" },
    { id: "t02", title: "处理 3 条异常交易告警", priority: "high", deadline: "今天 18:00", module: "风险监控" },
    { id: "t03", title: "确认明日资金调拨计划", priority: "medium", deadline: "今天 17:00", module: "资金管理" },
    { id: "t04", title: "完成季度合规报告初稿", priority: "medium", deadline: "本周五", module: "合规管理" },
    { id: "t05", title: "检查明日系统维护窗口", priority: "low", deadline: "明天 10:00", module: "系统管理" },
  ],
};