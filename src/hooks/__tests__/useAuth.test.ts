// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { useAuthStore } from "../../stores/authStore";
import type { User } from "../../types/user";

const mockUser: User = {
  id: "u001",
  username: "admin",
  nickname: "管理员",
  email: "admin@bank.com",
  phone: "13800138000",
  status: "active",
  roleIds: ["r01"],
  department: "技术部",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-06-01T00:00:00",
};

describe("useAuth", () => {
  beforeEach(() => {
    // 规则4：beforeEach 只做数据清空
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it("初始状态应为未登录", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("登录后应返回用户信息和 isAuthenticated=true", () => {
    const { result } = renderHook(() => useAuth());
    act(() => useAuthStore.getState().setUser(mockUser, "test-token"));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe("test-token");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logout 应清除所有认证状态", () => {
    useAuthStore.setState({ user: mockUser, token: "tok", isAuthenticated: true });
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("setUser 应能更新为用户 B", () => {
    const userB: User = { ...mockUser, id: "u002", username: "operator" };
    useAuthStore.setState({ user: mockUser, token: "tok", isAuthenticated: true });
    const { result } = renderHook(() => useAuth());
    act(() => useAuthStore.getState().setUser(userB, "token-b"));
    expect(result.current.user?.id).toBe("u002");
    expect(result.current.token).toBe("token-b");
  });
});