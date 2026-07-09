/**
 * 用户管理模块 Mock 数据
 *
 * 用于用户管理页面的列表展示和 CRUD 操作模拟。
 * 可扩展点：追加用户条目扩充测试数据。
 */
import type { User } from "../../types/user";

/** Mock 用户列表（不含密码） */
export const MOCK_USER_LIST: User[] = [
  {
    id: "u001",
    username: "admin",
    nickname: "系统管理员",
    email: "admin@bank.com",
    phone: "13800138000",
    status: "active",
    roleIds: ["r01"],
    department: "技术部",
    createdAt: "2026-01-01T00:00:00",
    updatedAt: "2026-06-01T00:00:00",
  },
  {
    id: "u002",
    username: "operator",
    nickname: "业务操作员",
    email: "oper@bank.com",
    phone: "13900139000",
    status: "active",
    roleIds: ["r02"],
    department: "运营部",
    createdAt: "2026-02-15T00:00:00",
    updatedAt: "2026-05-20T00:00:00",
  },
  {
    id: "u003",
    username: "auditor",
    nickname: "审计员",
    email: "audit@bank.com",
    phone: "13700137000",
    status: "active",
    roleIds: ["r03"],
    department: "风控部",
    createdAt: "2026-03-01T00:00:00",
    updatedAt: "2026-04-15T00:00:00",
  },
  {
    id: "u004",
    username: "zhangsan",
    nickname: "张三",
    email: "zhangsan@bank.com",
    phone: "13600136000",
    status: "disabled",
    roleIds: ["r02"],
    department: "运营部",
    createdAt: "2026-03-10T00:00:00",
    updatedAt: "2026-06-20T00:00:00",
  },
  {
    id: "u005",
    username: "lisi",
    nickname: "李四",
    email: "lisi@bank.com",
    phone: "13500135000",
    status: "locked",
    roleIds: ["r04"],
    department: "市场部",
    createdAt: "2026-04-01T00:00:00",
    updatedAt: "2026-07-01T00:00:00",
  },
];

/** Mock 角色列表 */
export const MOCK_ROLES = [
  { id: "r01", name: "超级管理员", code: "admin", description: "拥有所有权限", permissionIds: ["p001","p002","p003","p004","p005","p006","p007","p008","p009","p010","p011","p012"], status: "active" as const, userCount: 1, createdAt: "2026-01-01" },
  { id: "r02", name: "业务操作员", code: "operator", description: "日常业务操作权限", permissionIds: ["p001","p002","p003","p009","p010","p011"], status: "active" as const, userCount: 2, createdAt: "2026-01-01" },
  { id: "r03", name: "审计员", code: "auditor", description: "查看和审核权限", permissionIds: ["p001","p004","p005","p006","p012"], status: "active" as const, userCount: 1, createdAt: "2026-01-01" },
  { id: "r04", name: "只读用户", code: "viewer", description: "仅可查看数据", permissionIds: ["p001"], status: "active" as const, userCount: 1, createdAt: "2026-01-01" },
];

/** Mock 权限树 */
export const MOCK_PERMISSIONS: Record<string, { id: string; name: string; code: string; type: "menu" | "action"; parentId: string | null; sort: number; label: string }> = {
  p001: { id: "p001", name: "仪表盘查看", code: "dashboard:view", type: "menu", parentId: null, sort: 1, label: "仪表盘" },
  p002: { id: "p002", name: "用户列表", code: "user:list", type: "menu", parentId: null, sort: 2, label: "用户管理" },
  p003: { id: "p003", name: "用户创建", code: "user:create", type: "action", parentId: "p002", sort: 1, label: "新增用户" },
  p004: { id: "p004", name: "交易列表", code: "transaction:list", type: "menu", parentId: null, sort: 3, label: "交易管理" },
  p005: { id: "p005", name: "交易审核", code: "transaction:approve", type: "action", parentId: "p004", sort: 1, label: "审核交易" },
  p006: { id: "p006", name: "账户管理", code: "account:list", type: "menu", parentId: null, sort: 4, label: "账户管理" },
  p007: { id: "p007", name: "系统配置", code: "system:config", type: "menu", parentId: null, sort: 5, label: "系统设置" },
  p008: { id: "p008", name: "操作日志", code: "system:logs", type: "menu", parentId: null, sort: 6, label: "操作日志" },
  p009: { id: "p009", name: "用户编辑", code: "user:edit", type: "action", parentId: "p002", sort: 2, label: "编辑用户" },
  p010: { id: "p010", name: "用户删除", code: "user:delete", type: "action", parentId: "p002", sort: 3, label: "删除用户" },
  p011: { id: "p011", name: "用户状态", code: "user:status", type: "action", parentId: "p002", sort: 4, label: "启用/禁用" },
  p012: { id: "p012", name: "账户详情", code: "account:detail", type: "action", parentId: "p006", sort: 1, label: "查看详情" },
};