/**
 * 交易管理模块 MSW 请求处理器
 *
 * 模拟交易列表的分页查询和详情接口。
 * 可扩展点：新增审核操作接口时在此文件中添加 handler。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_TRANSACTIONS } from "../data/transactions";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { Transaction } from "../../types/transaction";

const API_PREFIX = "/api";

export const transactionHandlers = [
  /** GET /api/transactions — 分页获取交易列表 */
  http.get(`${API_PREFIX}/transactions`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const status = url.searchParams.get("status");
    const direction = url.searchParams.get("direction");
    const keyword = url.searchParams.get("keyword");
    const minAmount = url.searchParams.get("minAmount");
    const maxAmount = url.searchParams.get("maxAmount");

    let filtered = [...MOCK_TRANSACTIONS];
    if (status) {
      filtered = filtered.filter((tx) => tx.status === status);
    }
    if (direction) {
      filtered = filtered.filter((tx) => tx.direction === direction);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.transactionNo.toLowerCase().includes(kw) ||
          tx.counterparty.toLowerCase().includes(kw) ||
          tx.description.toLowerCase().includes(kw)
      );
    }
    if (minAmount) {
      filtered = filtered.filter((tx) => tx.amount >= parseInt(minAmount, 10));
    }
    if (maxAmount) {
      filtered = filtered.filter((tx) => tx.amount <= parseInt(maxAmount, 10));
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return HttpResponse.json<ApiResponse<PaginatedData<Transaction>>>(
      { code: 0, message: "ok", data: { list, total, page, pageSize } },
      { status: 200 }
    );
  }),

  /** GET /api/transactions/:id — 获取单条交易详情 */
  http.get(`${API_PREFIX}/transactions/:id`, async ({ params }) => {
    await delay(100);
    const transaction = MOCK_TRANSACTIONS.find((tx) => tx.id === params.id);
    if (!transaction) {
      return HttpResponse.json<ApiResponse>(
        { code: 404, message: "交易记录不存在", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json<ApiResponse<Transaction>>(
      { code: 0, message: "ok", data: transaction },
      { status: 200 }
    );
  }),
];
