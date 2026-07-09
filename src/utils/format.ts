/**
 * 格式化工具函数集
 *
 * 所有涉及数据展示格式化的函数集中在此文件，方便统一修改展示规则。
 */

/**
 * 格式化日期
 * @example formatDate('2026-07-09T10:30:00') // => '2026-07-09'
 */
export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
  } catch {
    return '-';
  }
}

/**
 * 格式化日期时间
 * @example formatDateTime('2026-07-09T10:30:00') // => '2026-07-09 10:30'
 */
export function formatDateTime(dateStr: string | Date): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch {
    return '-';
  }
}

/**
 * 格式化金额（分转元，保留两位小数）
 * @param cents 金额，单位：分
 * @param showSymbol 是否显示货币符号
 * @example formatMoney(123456) // => '¥1,234.56'
 * @example formatMoney(100)    // => '¥1.00'
 */
export function formatMoney(cents: number, showSymbol = true): string {
  if (cents == null || isNaN(cents)) return '-';
  const yuan = cents / 100;
  const formatted = yuan.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? '¥' + formatted : formatted;
}

/**
 * 手机号脱敏
 * @example maskPhone('13812345678') // => '138****5678'
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '-';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/**
 * 邮箱脱敏
 * @example maskEmail('test@example.com') // => 't***@example.com'
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '-';
  const [name, domain] = email.split('@');
  return name[0] + '***@' + domain;
}

/**
 * 账号脱敏（仅显示后4位）
 * @example maskAccount('6222021234567890') // => '****7890'
 */
export function maskAccount(accountNo: string): string {
  if (!accountNo) return '-';
  if (accountNo.length <= 4) return accountNo;
  return '****' + accountNo.slice(-4);
}