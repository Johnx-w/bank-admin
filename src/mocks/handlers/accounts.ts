/**
 * 账户管理模块 MSW 请求处理器
 *
 * 模拟账户列表查询、详情、开户、冻结/解冻接口。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_ACCOUNTS } from "../data/accounts";
import type { ApiResponse, PaginatedData } from "../../types/api";

const API_PREFIX = "/api";
let accounts = [...MOCK_ACCOUNTS];
let nextId = 10;

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

    let filtered = [...accounts];
    if (status) filtered = filtered.filter((acc) => acc.status === status);
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
    const list = filtered.slice(start, start + pageSize).map(
      ({ balanceRecords, ...rest }) => rest
    );

    return HttpResponse.json<ApiResponse<PaginatedData<Record<string, unknown>>>>(
      { code: 0, message: "ok", data: { list, total, page, pageSize } },
      { status: 200 }
    );
  }),

  /** GET /api/accounts/:id — 获取账户详情 */
  http.get(`${API_PREFIX}/accounts/:id`, async ({ params }) => {
    await delay(100);
    const account = accounts.find((acc) => acc.id === params.id);
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

  /** POST /api/accounts — 开户 */
  http.post(`${API_PREFIX}/accounts`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as {
      holderName: string;
      holderId: string;
      type: string;
      currency: string;
      initialDeposit: number;
    };

    const newAccount: AccountDetailResponse = {
      id: "acc" + String(nextId++).padStart(3, "0"),
      accountNo: "6222" + String(Math.floor(Math.random() * 90000000) + 10000000),
      holderName: body.holderName,
      holderId: body.holderId,
      type: body.type,
      currency: body.currency,
      balance: body.initialDeposit || 0,
      status: "active",
      openDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      balanceRecords: body.initialDeposit
        ? [
            {
              id: "br" + Date.now(),
              date: new Date().toISOString().slice(0, 10),
              type: "income",
              amount: body.initialDeposit,
              balanceAfter: body.initialDeposit,
              description: "初始存入",
            },
          ]
        : [],
    };

    accounts.unshift(newAccount);
    return HttpResponse.json<ApiResponse<Record<string, unknown>>>(
      { code: 0, message: "开户成功", data: newAccount },
      { status: 201 }
    );
  }),

  /** PATCH /api/accounts/:id/status — 冻结/解冻账户 */
  http.patch(`${API_PREFIX}/accounts/:id/status`, async ({ params, request }) => {
    await delay(200);
    const idx = accounts.findIndex((acc) => acc.id === params.id);
    if (idx === -1) {
      return HttpResponse.json<ApiResponse>(
        { code: 404, message: "账户不存在", data: null },
        { status: 404 }
      );
    }
    const body = (await request.json()) as { status: string };
    accounts[idx] = {
      ...accounts[idx],
      status: body.status,
      freezeReason: body.status === "frozen" ? "人工冻结" : undefined,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json<ApiResponse<Record<string, unknown>>>(
      { code: 0, message: body.status === "frozen" ? "账户已冻结" : "账户已解冻", data: accounts[idx] },
      { status: 200 }
    );
  }),
];
