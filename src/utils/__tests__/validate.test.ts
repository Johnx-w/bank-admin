import { describe, it, expect } from "vitest";
import { validatePhone, validateEmail, validateAmount, validatePassword, validateIdCard } from "../validate";

describe("validatePhone", () => {
  it("空值通过", async () => { await expect(validatePhone(null, "")).resolves.toBeUndefined(); });
  it("正确手机号通过", async () => { await expect(validatePhone(null, "13812345678")).resolves.toBeUndefined(); });
  for (const p of ["13","14","15","17","18","19"]) {
    it(p + "号段支持", async () => { await expect(validatePhone(null, p + "80001234")).resolves.toBeUndefined(); });
  }
  it("10位不过", async () => { await expect(validatePhone(null, "1381234567")).rejects.toThrow(); });
  it("字母开头不过", async () => { await expect(validatePhone(null, "a3812345678")).rejects.toThrow(); });
});

describe("validateEmail", () => {
  it("空值通过", async () => { await expect(validateEmail(null, "")).resolves.toBeUndefined(); });
  it("正确邮箱通过", async () => { await expect(validateEmail(null, "user@example.com")).resolves.toBeUndefined(); });
  it("无@不过", async () => { await expect(validateEmail(null, "user")).rejects.toThrow(); });
  it("无域名不过", async () => { await expect(validateEmail(null, "user@")).rejects.toThrow(); });
});

describe("validateAmount", () => {
  it("空值通过", async () => { await expect(validateAmount(null, null)).resolves.toBeUndefined(); });
  it("正整数通过", async () => { await expect(validateAmount(null, 100)).resolves.toBeUndefined(); });
  it("零通过", async () => { await expect(validateAmount(null, 0)).resolves.toBeUndefined(); });
  it("负数不过", async () => { await expect(validateAmount(null, -1)).rejects.toThrow(); });
  it("浮点数不过", async () => { await expect(validateAmount(null, 1.5)).rejects.toThrow(); });
  it("超出最大值不过", async () => { await expect(validateAmount(null, 100000000000)).rejects.toThrow(); });
});

describe("validatePassword", () => {
  it("空值通过", async () => { await expect(validatePassword(null, "")).resolves.toBeUndefined(); });
  it("8位含字母数字通过", async () => { await expect(validatePassword(null, "abc12345")).resolves.toBeUndefined(); });
  it("少于8位不过", async () => { await expect(validatePassword(null, "a1b2c3")).rejects.toThrow(); });
  it("无字母不过", async () => { await expect(validatePassword(null, "12345678")).rejects.toThrow(); });
  it("无数字不过", async () => { await expect(validatePassword(null, "abcdefgh")).rejects.toThrow(); });
});

describe("validateIdCard", () => {
  it("空值通过", async () => { await expect(validateIdCard(null, "")).resolves.toBeUndefined(); });
  it("18位尾号X通过", async () => { await expect(validateIdCard(null, "11010519900307723X")).resolves.toBeUndefined(); });
  it("18位尾号x通过", async () => { await expect(validateIdCard(null, "11010519900307723x")).resolves.toBeUndefined(); });
  it("15位不过", async () => { await expect(validateIdCard(null, "110105900307723")).rejects.toThrow(); });
  it("月份13不过", async () => { await expect(validateIdCard(null, "11010519901307723X")).rejects.toThrow(); });
});
