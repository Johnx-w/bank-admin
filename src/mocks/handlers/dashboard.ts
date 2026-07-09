/**
 * 仪表盘模块 MSW 请求处理器
 *
 * 模拟首页概览数据的接口。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_DASHBOARD } from "../data/dashboard";
import type { ApiResponse } from "../../types/api";
import type { DashboardData } from "../../types/dashboard";

const API_PREFIX = "/api";

export const dashboardHandlers = [
  /** GET /api/dashboard — 获取仪表盘数据 */
  http.get(`${API_PREFIX}/dashboard`, async () => {
    await delay(200);
    return HttpResponse.json<ApiResponse<DashboardData>>(
      { code: 0, message: "ok", data: MOCK_DASHBOARD },
      { status: 200 }
    );
  }),
];