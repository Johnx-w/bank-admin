/**
 * 全局常量定义
 *
 * 所有硬编码的枚举值、字典映射、状态配置集中在此文件，
 * 禁止在业务代码中使用魔法数字/字符串。
 * 可扩展点：新增模块时在此文件添加对应常量。
 */

// ---- 分页 ----
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ---- Token ----
export const TOKEN_KEY = 'bank_admin_token';
export const REFRESH_TOKEN_KEY = 'bank_admin_refresh_token';
export const TOKEN_EXPIRE_BUFFER = 5 * 60 * 1000;  // Token 过期前 5 分钟刷新

// ---- 货币 ----
export const DEFAULT_CURRENCY = 'CNY';
export const CURRENCY_SYMBOL: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
};

// ---- 用户状态 ----
export const USER_STATUS_OPTIONS = [
  { label: '正常', value: 'active', color: 'green' },
  { label: '禁用', value: 'disabled', color: 'red' },
  { label: '锁定', value: 'locked', color: 'orange' },
];

// ---- 账户状态 ----
export const ACCOUNT_STATUS_OPTIONS = [
  { label: '正常', value: 'active', color: 'green' },
  { label: '冻结', value: 'frozen', color: 'blue' },
  { label: '销户', value: 'closed', color: 'default' },
];

// ---- 交易状态 ----
export const TRANSACTION_STATUS_OPTIONS = [
  { label: '待审核', value: 'pending', color: 'orange' },
  { label: '已通过', value: 'approved', color: 'green' },
  { label: '已驳回', value: 'rejected', color: 'red' },
  { label: '已取消', value: 'cancelled', color: 'default' },
];

// ---- 交易方向 ----
export const TRANSACTION_DIRECTION_OPTIONS = [
  { label: '收入', value: 'income', color: 'green' },
  { label: '支出', value: 'expense', color: 'red' },
];

// ---- 优先级 ----
export const PRIORITY_OPTIONS = [
  { label: '高', value: 'high', color: 'red' },
  { label: '中', value: 'medium', color: 'orange' },
  { label: '低', value: 'low', color: 'green' },
];

// ---- API 基础路径 ----
// 开发环境: /api，生产环境(GitHub Pages): /bank-admin/api
// 确保 API 请求落在 Service Worker 作用域内，MSW 才能拦截
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.BASE_URL}api`;
export const REQUEST_TIMEOUT = 30000;  // 毫秒