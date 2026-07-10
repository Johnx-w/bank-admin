/**
 * 账户 Mock Handler 单元测试
 *
 * 验证 mock 数据完整性和 handler 导出。
 */
import { describe, it, expect } from "vitest";
import { MOCK_ACCOUNTS } from "../../data/accounts";
import { accountHandlers } from "../accounts";

describe("MOCK_ACCOUNTS", () => {
  it("数据数组非空", () => {
    expect(MOCK_ACCOUNTS.length).toBeGreaterThan(0);
  });

  it("每条记录含必要字段", () => {
    for (const acc of MOCK_ACCOUNTS) {
      expect(acc.id).toBeTruthy();
      expect(acc.accountNo).toBeTruthy();
      expect(acc.holderName).toBeTruthy();
      // 余额可以是负数（信用账户透支），但必须是数字
      expect(typeof acc.balance).toBe("number");
      expect(["active", "frozen", "closed"]).toContain(acc.status);
      expect(["savings", "checking", "credit"]).toContain(acc.type);
      expect(acc.openDate).toBeTruthy();
    }
  });

  it("覆盖所有账户状态", () => {
    const statuses = new Set(MOCK_ACCOUNTS.map((a) => a.status));
    for (const s of ["active", "frozen", "closed"]) {
      expect(statuses.has(s)).toBe(true);
    }
  });

  it("覆盖所有账户类型", () => {
    const types = new Set(MOCK_ACCOUNTS.map((a) => a.type));
    for (const t of ["savings", "checking", "credit"]) {
      expect(types.has(t)).toBe(true);
    }
  });

  it("余额变动记录数组存在", () => {
    for (const acc of MOCK_ACCOUNTS) {
      expect(Array.isArray(acc.balanceRecords)).toBe(true);
    }
  });

  it("冻结账户含冻结原因", () => {
    const frozen = MOCK_ACCOUNTS.filter((a) => a.status === "frozen");
    expect(frozen.length).toBeGreaterThan(0);
    for (const acc of frozen) {
      expect(acc.freezeReason).toBeTruthy();
    }
  });
});

describe("accountHandlers", () => {
  it("导出 4 个 handler（列表 + 详情 + 开户 + 状态变更）", () => {
    expect(accountHandlers).toHaveLength(4);
  });

  it("包含 POST 开户路由", () => {
    const createHandler = accountHandlers.find(
      (h) => h.info.method === "POST"
    );
    expect(createHandler).toBeDefined();
  });

  it("包含 PATCH 状态变更路由", () => {
    const patchHandler = accountHandlers.find(
      (h) => h.info.method === "PATCH"
    );
    expect(patchHandler).toBeDefined();
  });
});
