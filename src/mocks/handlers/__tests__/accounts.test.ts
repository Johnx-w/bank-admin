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
      expect(["savings", "checking", "credit"]).toContain(acc.type);
      expect(["active", "frozen", "closed"]).toContain(acc.status);
      expect(acc.openDate).toBeTruthy();
      expect(Array.isArray(acc.balanceRecords)).toBe(true);
    }
  });

  it("覆盖所有账户状态", () => {
    const statuses = new Set(MOCK_ACCOUNTS.map((acc) => acc.status));
    for (const s of ["active", "frozen", "closed"]) {
      expect(statuses.has(s)).toBe(true);
    }
  });

  it("覆盖所有账户类型", () => {
    const types = new Set(MOCK_ACCOUNTS.map((acc) => acc.type));
    for (const t of ["savings", "checking", "credit"]) {
      expect(types.has(t)).toBe(true);
    }
  });

  it("冻结账户含冻结原因", () => {
    const frozen = MOCK_ACCOUNTS.filter((acc) => acc.status === "frozen");
    expect(frozen.length).toBeGreaterThan(0);
    for (const acc of frozen) {
      expect(acc.freezeReason).toBeTruthy();
    }
  });

  it("至少一个账户有余额变动记录", () => {
    const withRecords = MOCK_ACCOUNTS.filter(
      (acc) => acc.balanceRecords.length > 0
    );
    expect(withRecords.length).toBeGreaterThan(0);
  });
});

describe("accountHandlers", () => {
  it("导出两个 handler（列表 + 详情）", () => {
    expect(accountHandlers).toHaveLength(2);
  });
});