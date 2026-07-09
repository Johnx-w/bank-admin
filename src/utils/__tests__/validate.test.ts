import { describe, it, expect } from "vitest";
import { validatePhone, validateEmail, validateAmount, validatePassword, validateIdCard } from "../validate";

describe("validatePhone", () => {
  it("空值通过", async () => { await expect(validatePhone(null, "")).resolves.toBeUndefined(); });
  it("正确手机号通过", async () => { await expect(validatePhone(null, "13812345678")).resolves.toBeUndefined(); });
  for (const p of ["13","14","15","17","18","19"]) {
  it(p + "号段支持", async () => { 
    await expect(validatePhone(null, p + "000000000")).resolves.toBeUndefined(); 
  });
  }
  it("10位不过", async () => { await expect(validatePhone(null, "1381234567")).rejects.toThrow(); });
  it("12位不过", async () => { await expect(validatePhone(null, "138123456789")).rejects.toThrow(); });
  it("字母开头不过", async () => { await expect(validatePhone(null, "a3812345678")).rejects.toThrow(); });
  it("号段12不过", async () => { await expect(validatePhone(null, "12812345678")).rejects.toThrow(); });
});

describe("validateEmail", () => {
  it("空值通过", async () => { await expect(validateEmail(null, "")).resolves.toBeUndefined(); });
  it("标准邮箱通过", async () => { await expect(validateEmail(null, "user@example.com")).resolves.toBeUndefined(); });
  it("含加号邮箱通过", async () => { await expect(validateEmail(null, "user+tag@company.cn")).resolves.toBeUndefined(); });
  it("含点邮箱通过", async () => { await expect(validateEmail(null, "first.last@domain.co")).resolves.toBeUndefined(); });
  it("无@不过", async () => { await expect(validateEmail(null, "userexample.com")).rejects.toThrow(); });
  it("无域名不过", async () => { await expect(validateEmail(null, "user@")).rejects.toThrow(); });
  it("无用户名不过", async () => { await expect(validateEmail(null, "@domain.com")).rejects.toThrow(); });
  it("中文域名不过", async () => { await expect(validateEmail(null, "user@测试.com")).rejects.toThrow(); });
});

describe("validateAmount", () => {
  it("空值通过", async () => { await expect(validateAmount(null, null as unknown as number)).resolves.toBeUndefined(); });
  it("正整数通过", async () => { await expect(validateAmount(null, 100)).resolves.toBeUndefined(); });
  it("零通过", async () => { await expect(validateAmount(null, 0)).resolves.toBeUndefined(); });
  it("负数不过", async () => { await expect(validateAmount(null, -1)).rejects.toThrow(); });
  it("浮点数不过", async () => { await expect(validateAmount(null, 1.5)).rejects.toThrow(); });
  it("超出最大值不过", async () => { await expect(validateAmount(null, 100000000000)).rejects.toThrow(); });
});

describe("validatePassword", () => {
  it("空值通过", async () => { await expect(validatePassword(null, "")).resolves.toBeUndefined(); });
  it("8位含字母数字通过", async () => { await expect(validatePassword(null, "abc12345")).resolves.toBeUndefined(); });
  it("20位含字母数字通过", async () => { await expect(validatePassword(null, "abcdefghij1234567890")).resolves.toBeUndefined(); });
  it("少于8位不过", async () => { await expect(validatePassword(null, "a1b2c3")).rejects.toThrow(); });
  it("超过20位不过", async () => { await expect(validatePassword(null, "abcdefghij1234567890x")).rejects.toThrow(); });
  it("无字母不过", async () => { await expect(validatePassword(null, "12345678")).rejects.toThrow(); });
  it("无数字不过", async () => { await expect(validatePassword(null, "abcdefgh")).rejects.toThrow(); });
  it("含特殊字符不过", async () => { await expect(validatePassword(null, "abc12345!")).rejects.toThrow(); });
});

describe("validateIdCard", () => {
  it("空值通过", async () => { await expect(validateIdCard(null, "")).resolves.toBeUndefined(); });

  // 有效身份证：110105199003077235（校验位 = 5）
  it("18位尾号数字通过", async () => { await expect(validateIdCard(null, "110105199003077235")).resolves.toBeUndefined(); });

  // 有效身份证：11010519900307723X（校验位 = 5，但最后一位是大写X）
  // 注意：这里需要真正的校验位为 X 的身份证号
  // 使用 32010519820909512X（实际校验位为 X）
  it("18位尾号X通过", async () => { await expect(validateIdCard(null, "11010519491231002X")).resolves.toBeUndefined(); });

  it("15位不过（格式不对）", async () => { await expect(validateIdCard(null, "110105900307723")).rejects.toThrow(); });
  it("月份13不过", async () => { await expect(validateIdCard(null, "110105199013077235")).rejects.toThrow(); });
  it("日号32不过", async () => { await expect(validateIdCard(null, "110105199001327235")).rejects.toThrow(); });
  it("校验位错误不过", async () => { await expect(validateIdCard(null, "110105199003077231")).rejects.toThrow(); });
});