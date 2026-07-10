/**
 * 系统管理 API 函数
 *
 * 封装操作日志查询、系统配置获取/保存等接口。
 */
import { getApi, putApi } from "./client";
import type { ApiResponse, PaginatedData } from "../types/api";
import type { OperationLog, SystemConfig } from "../types/system";

/** 系统日志查询参数 */
export interface SystemLogListParams {
  page: number;
  pageSize: number;
  type?: string;
  keyword?: string;
  dateRange?: [string, string];
}

/** 获取操作日志分页列表 */
export async function fetchLogList(
  params: SystemLogListParams
): Promise<ApiResponse<PaginatedData<OperationLog>>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.type) query.set("type", params.type);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.dateRange) {
    query.set("startDate", params.dateRange[0]);
    query.set("endDate", params.dateRange[1]);
  }
  return getApi<ApiResponse<PaginatedData<OperationLog>>>(
    "/settings/logs?" + query.toString()
  );
}

/** 获取系统配置 */
export async function fetchSystemConfig(): Promise<
  ApiResponse<SystemConfig>
> {
  return getApi<ApiResponse<SystemConfig>>("/settings/config");
}

/** 保存系统配置 */
export async function saveSystemConfig(
  data: Partial<SystemConfig>
): Promise<ApiResponse<SystemConfig>> {
  return putApi<ApiResponse<SystemConfig>>("/settings/config", data);
}
