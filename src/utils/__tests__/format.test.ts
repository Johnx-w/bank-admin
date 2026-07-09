import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatMoney, maskPhone, maskEmail, maskAccount } from "../format";

describe("formatDate", () => {
  it("格式化标准 ISO 日期", () => {
    expect(formatDate("2026-07-09T10:30:00")).toBe("2026-07-09");
  });
  it("格式化 Date 对象", () => {
    expect(formatDate(new Date(2026, 6, 9))).toBe("2026-07-09");
  });
  it("空值返回占位符", () => {
    expect(formatDate("")).toBe("-");
    expect(formatDate(null)).toBe("-");
  });
  it("无效日期返回占位符", () => {
    expect(formatDate("not-a-date")).toBe("-");
  });
});

describe("formatDateTime", () => {
  it("格式化完整日期时间", () => {
    expect(formatDateTime("2026-07-09T10:30:00")).toBe("2026-07-09 10:30");
  });
  it("空值返回占位符", () => { expect(formatDateTime("")).toBe("-"); });
});

describe("formatMoney", () => {
  it("分转元加符号", () => { expect(formatMoney(123456)).toBe("¥1,234.56"); });
  it("零分显示", () => { expect(formatMoney(0)).toBe("¥0.00"); });
  it("null返回占位符", () => { expect(formatMoney(null)).toBe("-"); });
  it("不显示符号", () => { expect(formatMoney(123456, false)).toBe("1,234.56"); });
});

describe("maskPhone", () => {
  it("脱敏中间四位", () => { expect(maskPhone("13812345678")).toBe("138****5678"); });
  it("短号码原样", () => { expect(maskPhone("12345")).toBe("12345"); });
  it("空返回占位符", () => { expect(maskPhone("")).toBe("-"); });
});

describe("maskEmail", () => {
  it("脱敏用户名", () => { expect(maskEmail("test@example.com")).toBe("t***@example.com"); });
  it("无@原样返回", () => { expect(maskEmail("invalid")).toBe("invalid"); });
  it("空返回占位符", () => { expect(maskEmail("")).toBe("-"); });
});

describe("maskAccount", () => {
  it("脱敏仅显示后4位", () => { expect(maskAccount("6222021234567890")).toBe("****7890"); });
  it("短账号原样", () => { expect(maskAccount("1234")).toBe("1234"); });
  it("空返回占位符", () => { expect(maskAccount("")).toBe("-"); });
});
