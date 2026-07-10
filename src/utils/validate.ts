/**
 * 表单校验规则
 *
 * 配合 Ant Design Form 的 rules 使用。
 * 可扩展点：新增校验规则直接在此文件添加导出函数，并在 constants.ts 中添加对应错误码。
 *
 * 注意：正则字面量中的 \d、\s 等不要写成 \\d、\\s，否则匹配的是字面反斜杠。
 */

/**
 * 校验手机号格式（11 位，号段 13-19）
 * @example validatePhone(null, '13812345678') => pass
 * @example validatePhone(null, '12345678901') => fail（号段不对）
 */
export function validatePhone(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (phoneRegex.test(value)) return Promise.resolve();
  return Promise.reject(new Error('请输入正确的11位手机号'));
}

/**
 * 校验邮箱格式（标准 RFC 5322 简化版）
 * @example validateEmail(null, 'user@example.com') => pass
 * @example validateEmail(null, 'user@') => fail
 */
export function validateEmail(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(value)) return Promise.resolve();
  return Promise.reject(new Error('请输入正确的邮箱格式'));
}

/**
 * 校验金额（单位：分，必须为正整数）
 *
 * 为什么用分？银行系统所有金额存整数（分），避免浮点数精度问题。
 * @example validateAmount(null, 100) => pass
 * @example validateAmount(null, -1) => fail
 * @example validateAmount(null, 1.5) => fail（金额必须是整数）
 */
export function validateAmount(_rule: unknown, value: number): Promise<void> {
  if (value == null) return Promise.resolve();
  if (!Number.isInteger(value)) return Promise.reject(new Error('金额必须为整数（单位：分）'));
  if (value < 0) return Promise.reject(new Error('金额不能为负数'));
  if (value > 99999999999) return Promise.reject(new Error('金额超出允许范围'));
  return Promise.resolve();
}

/**
 * 校验密码强度：8-20 位，必须包含字母和数字
 * @example validatePassword(null, 'abc12345') => pass
 * @example validatePassword(null, '12345678') => fail（无字母）
 */
export function validatePassword(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
  if (passwordRegex.test(value)) return Promise.resolve();
  return Promise.reject(new Error('密码必须为8-20位且包含字母和数字'));
}

/**
 * 身份证号校验：18 位，最后一位可以是数字或 X/x
 *
 * 校验步骤：
 * 1. 格式校验（正则）：地址码 + 出生日期 + 顺序码 + 校验位
 * 2. 校验位验证（加权因子算法）
 *
 * @example validateIdCard(null, '11010519900307723X') => pass
 */
export function validateIdCard(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();

  const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  const idRegex = /^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!idRegex.test(value)) {
    return Promise.reject(new Error('请输入正确的身份证号'));
  }

  // 校验位验证（加权因子算法）
  const chars = value.toUpperCase().split('');
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const digit = parseInt(chars[i], 10);
    if (isNaN(digit)) {
      return Promise.reject(new Error('请输入正确的身份证号'));
    }
    sum += digit * WEIGHTS[i];
  }
  const expectedCheckCode = CHECK_CODES[sum % 11];
  if (chars[17] !== expectedCheckCode) {
    return Promise.reject(new Error('请输入正确的身份证号（校验位不匹配）'));
  }

  return Promise.resolve();
}