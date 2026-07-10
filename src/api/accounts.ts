/**
 * 账户管理 API 函数
 *
 * 封装账户列表查询和详情查询，详情包含余额变动记录。
 */
import { getApi } from "./client";
import type { ApiResponse, PaginatedData } from "../types/api";
import type { Account } from "../types/account";

/** 账户列表查询参数 */
export interface AccountListParams {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}

/** 余额变动记录 */
export interface BalanceRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
}

/** 账户详情（含余额变动记录） */
export interface AccountDetail extends Account {
  balanceRecords: BalanceRecord[];
}

/** 获取账户分页列表 */
export async function fetchAccountList(
  params: AccountListParams
): Promise<ApiResponse<PaginatedData<Account>>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.keyword) query.set("keyword", params.keyword);
  return getApi<ApiResponse<PaginatedData<Account>>>(
    "/accounts?" + query.toString()
  );
}

/** 获取单个账户详情（含余额变动记录） */
export async function fetchAccountById(
  id: string
): Promise<ApiResponse<AccountDetail>> {
  return getApi<ApiResponse<AccountDetail>>("/accounts/" + id);
}
