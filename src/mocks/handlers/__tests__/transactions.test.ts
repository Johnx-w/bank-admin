/**
 * 交易 Mock Handler 单元测试
 *
 * 验证 mock 数据完整性和 handler 导出。
 */
import { describe, it, expect } from "vitest";
import { MOCK_TRANSACTIONS } from "../../data/transactions";
import { transactionHandlers } from "../transactions";

describe("MOCK_TRANSACTIONS", () => {
  it("数据数组非空", () => {
    expect(MOCK_TRANSACTIONS.length).toBeGreaterThan(0);
  });

  it("每条记录含必要字段", () => {
    for (const tx of MOCK_TRANSACTIONS) {
      expect(tx.id).toBeTruthy();
      expect(tx.transactionNo).toBeTruthy();
      expect(tx.amount).toBeGreaterThan(0);
      expect(["income", "expense"]).toContain(tx.direction);
      expect(["pending", "approved", "rejected", "cancelled"]).toContain(tx.status);
      expect(tx.createdAt).toBeTruthy();
    }
  });

  it("覆盖所有交易状态", () => {
    const statuses = new Set(MOCK_TRANSACTIONS.map((tx) => tx.status));
    for (const s of ["pending", "approved", "rejected", "cancelled"]) {
      expect(statuses.has(s)).toBe(true);
    }
  });

  it("覆盖所有交易方向", () => {
    const directions = new Set(MOCK_TRANSACTIONS.map((tx) => tx.direction));
    expect(directions.has("income")).toBe(true);
    expect(directions.has("expense")).toBe(true);
  });

  it("已审核交易含审核信息", () => {
    const audited = MOCK_TRANSACTIONS.filter(
      (tx) => tx.status === "approved" || tx.status === "rejected"
    );
    expect(audited.length).toBeGreaterThan(0);
    for (const tx of audited) {
      if (tx.auditorId) expect(tx.auditedAt).toBeTruthy();
    }
  });
});

describe("transactionHandlers", () => {
  it("导出 3 个 handler（列表 + 详情 + 审核）", () => {
    expect(transactionHandlers).toHaveLength(3);
  });

  it("包含审核路由", () => {
    const auditHandler = transactionHandlers.find(
      (h) => h.info.method === "PATCH"
    );
    expect(auditHandler).toBeDefined();
  });
});
