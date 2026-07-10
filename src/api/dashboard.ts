/**
 * 仪表盘 API 函数
 */
import { getApi } from "./client";
import type { ApiResponse } from "../types/api";
import type { DashboardData } from "../types/dashboard";

/** 获取仪表盘数据 */
export async function fetchDashboard(): Promise<
  ApiResponse<DashboardData>
> {
  return getApi<ApiResponse<DashboardData>>("/dashboard");
}
