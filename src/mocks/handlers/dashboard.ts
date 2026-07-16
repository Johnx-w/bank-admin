/**
 * 仪表盘模块 MSW 请求处理器
 *
 * 模拟首页概览数据的接口。
 * 说明：pendingAudit 和 anomalyCount 动态统计自 MOCK_TRANSACTIONS，
 *       确保与交易管理页面的数据保持一致，避免"概览 23 笔，实际 3 笔"的偏差。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_DASHBOARD } from "../data/dashboard";
import { MOCK_TRANSACTIONS } from "../data/transactions";
import type { ApiResponse } from "../../types/api";
import type { DashboardData } from "../../types/dashboard";

import { API_BASE_URL as API_PREFIX } from "../../utils/constants";

export const dashboardHandlers = [
  /** GET /api/dashboard — 获取仪表盘数据 */
  http.get(`${API_PREFIX}/dashboard`, async () => {
    await delay(200);

    const pendingAudit = MOCK_TRANSACTIONS.filter(
      (tx) => tx.status === "pending",
    ).length;
    const anomalyCount = MOCK_TRANSACTIONS.filter(
      (tx) => tx.status === "rejected",
    ).length;

    const data: DashboardData = {
      ...MOCK_DASHBOARD,
      stats: {
        ...MOCK_DASHBOARD.stats,
        pendingAudit,
        anomalyCount,
      },
      todos: MOCK_DASHBOARD.todos.map((todo) => {
        if (todo.id === "t01") {
          return { ...todo, title: `审核待处理交易 ${pendingAudit} 笔` };
        }
        if (todo.id === "t02") {
          return { ...todo, title: `处理 ${anomalyCount} 条异常交易告警` };
        }
        return todo;
      }),
    };

    return HttpResponse.json<ApiResponse<DashboardData>>(
      { code: 0, message: "ok", data },
      { status: 200 }
    );
  }),
];