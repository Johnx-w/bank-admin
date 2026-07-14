/**
 * 交易管理模块 MSW 请求处理器
 *
 * 模拟交易列表的分页查询、详情和审核操作接口。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_TRANSACTIONS } from "../data/transactions";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { Transaction } from "../../types/transaction";

import { API_BASE_URL as API_PREFIX } from "../../utils/constants";
let transactions = [...MOCK_TRANSACTIONS];

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

    let filtered = [...transactions];
    if (status) filtered = filtered.filter((tx) => tx.status === status);
    if (direction) filtered = filtered.filter((tx) => tx.direction === direction);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.transactionNo.toLowerCase().includes(kw) ||
          tx.counterparty.toLowerCase().includes(kw) ||
          tx.description.toLowerCase().includes(kw)
      );
    }
    if (minAmount) filtered = filtered.filter((tx) => tx.amount >= parseInt(minAmount, 10));
    if (maxAmount) filtered = filtered.filter((tx) => tx.amount <= parseInt(maxAmount, 10));

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
    const transaction = transactions.find((tx) => tx.id === params.id);
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

  /** PATCH /api/transactions/audit — 批量审核（通过/驳回） */
  http.patch(`${API_PREFIX}/transactions/audit`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as {
      transactionIds: string[];
      action: "approve" | "reject";
      remark?: string;
    };

    if (!body.transactionIds || body.transactionIds.length === 0) {
      return HttpResponse.json<ApiResponse>(
        { code: 400, message: "请选择要审核的交易", data: null },
        { status: 400 }
      );
    }

    const updated: Transaction[] = [];
    const now = new Date().toISOString();
    for (const id of body.transactionIds) {
      const idx = transactions.findIndex((tx) => tx.id === id);
      if (idx === -1) continue;
      if (transactions[idx].status !== "pending") {
        continue; // 跳过非待审核状态的交易
      }
      transactions[idx] = {
        ...transactions[idx],
        status: body.action === "approve" ? "approved" : "rejected",
        auditorId: "u001",
        auditRemark: body.remark || "",
        auditedAt: now,
      };
      updated.push(transactions[idx]);
    }

    return HttpResponse.json<ApiResponse<Transaction[]>>(
      {
        code: 0,
        message: body.action === "approve" ? "审核通过成功" : "已驳回选中交易",
        data: updated,
      },
      { status: 200 }
    );
  }),
];
