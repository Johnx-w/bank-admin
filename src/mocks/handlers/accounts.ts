/**
 * 账户管理模块 MSW 请求处理器
 *
 * 模拟账户列表的分页查询和详情接口。
 * 详情接口返回完整账户信息含余额变动记录。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_ACCOUNTS } from "../data/accounts";
import type { ApiResponse, PaginatedData } from "../../types/api";

const API_PREFIX = "/api";

/** 账户详情响应（含余额变动记录） */
interface AccountDetailResponse {
  id: string;
  accountNo: string;
  holderName: string;
  holderId: string;
  type: string;
  currency: string;
  balance: number;
  status: string;
  openDate: string;
  freezeReason?: string;
  createdAt: string;
  updatedAt: string;
  balanceRecords: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
  }>;
}

export const accountHandlers = [
  /** GET /api/accounts — 分页获取账户列表 */
  http.get(`${API_PREFIX}/accounts`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const status = url.searchParams.get("status");
    const keyword = url.searchParams.get("keyword");

    let filtered = [...MOCK_ACCOUNTS];
    if (status) {
      filtered = filtered.filter((acc) => acc.status === status);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.accountNo.includes(kw) ||
          acc.holderName.toLowerCase().includes(kw)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    // 列表接口不返回 balanceRecords
    const list = filtered.slice(start, start + pageSize).map(({ balanceRecords, ...rest }) => rest);

    return HttpResponse.json<ApiResponse<PaginatedData<Record<string, unknown>>>>(
      { code: 0, message: "ok", data: { list, total, page, pageSize } },
      { status: 200 }
    );
  }),

  /** GET /api/accounts/:id — 获取单个账户详情（含余额变动记录） */
  http.get(`${API_PREFIX}/accounts/:id`, async ({ params }) => {
    await delay(100);
    const account = MOCK_ACCOUNTS.find((acc) => acc.id === params.id);
    if (!account) {
      return HttpResponse.json<ApiResponse>(
        { code: 404, message: "账户不存在", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json<ApiResponse<AccountDetailResponse>>(
      { code: 0, message: "ok", data: account },
      { status: 200 }
    );
  }),
];
