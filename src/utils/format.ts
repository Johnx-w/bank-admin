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

/** 星期映射 */
const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 智能格式化截止日期
 *
 * 规则：
 *   - 今天截止 → "今天 HH:mm"
 *   - 明天截止 → "明天 HH:mm"
 *   - 本周截止 → "本周X HH:mm"
 *   - 其他     → "MM-DD HH:mm"
 *
 * @param dateStr 日期字符串，支持 "YYYY-MM-DD" 或 "YYYY-MM-DD HH:mm"
 * @example formatSmartDeadline('2026-07-16 18:00') // => '今天 18:00'
 * @example formatSmartDeadline('2026-07-18 10:00') // => '本周六 10:00'
 */
export function formatSmartDeadline(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    // 兼容 "YYYY-MM-DD" 和 "YYYY-MM-DD HH:mm" 两种格式
    const normalized = dateStr.includes('T')
      ? dateStr
      : dateStr.replace(' ', 'T') + (dateStr.includes(':') ? '' : 'T00:00');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (diffDays === 0) return `今天 ${time}`;
    if (diffDays === 1) return `明天 ${time}`;

    // 本周：周一为本周第一天，周日为最后一天
    const dayOfWeek = now.getDay(); // 0=周日
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    if (diffDays > 1 && diffDays <= daysUntilSunday) {
      return `本周${WEEKDAY_NAMES[d.getDay()]} ${time}`;
    }

    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${time}`;
  } catch {
    return dateStr;
  }
}