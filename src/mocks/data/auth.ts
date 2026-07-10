/**
 * 认证模块 Mock 数据
 *
 * 提供登录验证用的模拟用户数据。
 * 可扩展点：新增 mock 用户时在此数组追加条目。
 */
import type { User } from "../../types/user";

/** 包含密码的 Mock 用户类型（仅供 mock 层内部使用） */
export interface MockAuthUser extends User {
  password: string;
}

/** Mock 用户列表 */
export const MOCK_USERS: MockAuthUser[] = [
  {
    id: "u001",
    username: "admin",
    password: "admin123",
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
    password: "oper1234",
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
    password: "audit123",
    nickname: "审计员",
    email: "audit@bank.com",
    phone: "13700137000",
    status: "active",
    roleIds: ["r03"],
    department: "风控部",
    createdAt: "2026-03-01T00:00:00",
    updatedAt: "2026-04-15T00:00:00",
  },
];

/** 固定 Token */
export const MOCK_TOKEN = "mock-jwt-token-20260709";