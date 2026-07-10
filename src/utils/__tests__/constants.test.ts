import { describe, it, expect } from "vitest";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, TOKEN_KEY,
  USER_STATUS_OPTIONS, TRANSACTION_STATUS_OPTIONS, PRIORITY_OPTIONS, CURRENCY_SYMBOL } from "../constants";

describe("constants", () => {
  it("DEFAULT_PAGE_SIZE = 10", () => { expect(DEFAULT_PAGE_SIZE).toBe(10); });
  it("PAGE_SIZE_OPTIONS 含标准选项", () => {
    expect(PAGE_SIZE_OPTIONS).toContain(10);
    expect(PAGE_SIZE_OPTIONS).toContain(20);
    expect(PAGE_SIZE_OPTIONS).toContain(50);
    expect(PAGE_SIZE_OPTIONS).toContain(100);
  });
  it("TOKEN_KEY 正确", () => { expect(TOKEN_KEY).toBe("bank_admin_token"); });
  it("用户状态含 active/disabled/locked", () => {
    const v = USER_STATUS_OPTIONS.map(o => o.value);
    expect(v).toContain("active"); expect(v).toContain("disabled"); expect(v).toContain("locked");
  });
  it("交易状态含 pending/approved/rejected/cancelled", () => {
    const v = TRANSACTION_STATUS_OPTIONS.map(o => o.value);
    expect(v).toEqual(["pending","approved","rejected","cancelled"]);
  });
  it("优先级含 high/medium/low", () => {
    const v = PRIORITY_OPTIONS.map(o => o.value);
    expect(v).toEqual(["high","medium","low"]);
  });
  it("货币符号映射正确", () => {
    expect(CURRENCY_SYMBOL.CNY).toBe("¥");
    expect(CURRENCY_SYMBOL.USD).toBe("$");
  });
});
