/**
 * 表单校验规则
 *
 * 配合 Ant Design Form 的 rules 使用。
 * 可扩展点：新增校验规则直接在此文件添加导出函数。
 */

/** 校验手机号格式 */
export function validatePhone(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  const phoneRegex = /^1[3-9]\\d{9}$/;
  if (phoneRegex.test(value)) return Promise.resolve();
  return Promise.reject(new Error('请输入正确的11位手机号'));
}

/** 校验邮箱格式 */
export function validateEmail(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (emailRegex.test(value)) return Promise.resolve();
  return Promise.reject(new Error('请输入正确的邮箱格式'));
}

/** 校验金额（单位：分，必须为正整数） */
export function validateAmount(_rule: unknown, value: number): Promise<void> {
  if (value == null) return Promise.resolve();
  if (!Number.isInteger(value)) return Promise.reject(new Error('金额必须为整数（单位：分）'));
  if (value < 0) return Promise.reject(new Error('金额不能为负数'));
  if (value > 99999999999) return Promise.reject(new Error('金额超出允许范围'));
  return Promise.resolve();
}

/** 校验密码强度（至少8位，含字母和数字） */
export function validatePassword(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  if (value.length < 8) return Promise.reject(new Error('密码至少8位'));
  if (!/[a-zA-Z]/.test(value)) return Promise.reject(new Error('密码必须包含字母'));
  if (!/\\d/.test(value)) return Promise.reject(new Error('密码必须包含数字'));
  return Promise.resolve();
}

/** 身份证号校验（简单格式校验） */
export function validateIdCard(_rule: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  const idRegex = /^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$/;
  if (idRegex.test(value)) return Promise.resolve();
  return Promise.reject(new Error('请输入正确的身份证号'));
}