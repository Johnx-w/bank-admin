/**
 * 仪表盘模块 MSW 请求处理器
 *
 * 模拟首页概览数据的接口。
 * 说明：
 *   - pendingAudit 统计 status=pending 的交易数
 *   - anomalyCount 统计 pending 且金额 ≥ ¥5,000 的大额异常交易
 *     这些交易既需要审核又存在风险，审核后会自动减少
 *   - 动态统计确保审核操作后数据实时更新
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_DASHBOARD } from "../data/dashboard";
import { transactions } from "./transactions";
import type { ApiResponse } from "../../types/api";
import type { DashboardData } from "../../types/dashboard";

import { API_BASE_URL as API_PREFIX } from "../../utils/constants";

/** 大额交易阈值（分），≥ ¥5,000 视为异常需要关注 */
const ANOMALY_AMOUNT_THRESHOLD = 500_000;

export const dashboardHandlers = [
  /** GET /api/dashboard — 获取仪表盘数据 */
  http.get(`${API_PREFIX}/dashboard`, async () => {
    await delay(200);

    const pendingTxs = transactions.filter(
      (tx) => tx.status === "pending",
    );
    const pendingAudit = pendingTxs.length;
    const anomalyCount = pendingTxs.filter(
      (tx) => tx.amount >= ANOMALY_AMOUNT_THRESHOLD,
    ).length;

    const data: DashboardData = {
      ...MOCK_DASHBOARD,
      stats: {
        ...MOCK_DASHBOARD.stats,
        pendingAudit,
        anomalyCount,
      },
    };

    return HttpResponse.json<ApiResponse<DashboardData>>(
      { code: 0, message: "ok", data },
      { status: 200 }
    );
  }),
];