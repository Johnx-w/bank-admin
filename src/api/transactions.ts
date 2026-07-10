/**
 * 交易管理 API 函数
 *
 * 提供交易列表查询、详情查询和审核操作（通过/驳回）。
 */
import { getApi, patchApi } from "./client";
import type { ApiResponse, PaginatedData } from "../types/api";
import type { Transaction } from "../types/transaction";

/** 交易列表查询参数 */
export interface TransactionListParams {
  page: number;
  pageSize: number;
  status?: string;
  direction?: string;
  keyword?: string;
  minAmount?: string;
  maxAmount?: string;
}

/** 审核操作参数 */
export interface AuditParams {
  transactionIds: string[];
  action: "approve" | "reject";
  remark: string;
}

/** 获取交易分页列表 */
export async function fetchTransactionList(
  params: TransactionListParams
): Promise<ApiResponse<PaginatedData<Transaction>>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.direction) query.set("direction", params.direction);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.minAmount) query.set("minAmount", params.minAmount);
  if (params.maxAmount) query.set("maxAmount", params.maxAmount);
  return getApi<ApiResponse<PaginatedData<Transaction>>>(
    "/transactions?" + query.toString()
  );
}

/** 获取单笔交易详情 */
export async function fetchTransactionById(
  id: string
): Promise<ApiResponse<Transaction>> {
  return getApi<ApiResponse<Transaction>>("/transactions/" + id);
}

/** 审核交易（通过/驳回） */
export async function auditTransactions(
  params: AuditParams
): Promise<ApiResponse<Transaction[]>> {
  return patchApi<ApiResponse<Transaction[]>>(
    "/transactions/audit",
    params
  );
}
