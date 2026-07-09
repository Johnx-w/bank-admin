import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../authStore";
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

describe("authStore", () => {
  beforeEach(() => {
    // 每个测试前重置 store 到初始状态
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  it("初始状态应该为未登录", () => {
    const { user, token, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it("setUser 应该更新用户信息和登录状态", () => {
    useAuthStore.getState().setUser(mockUser, "jwt-token-abc");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe("jwt-token-abc");
    expect(state.isAuthenticated).toBe(true);
  });

  it("setUser 应该将 token 写入 localStorage", () => {
    useAuthStore.getState().setUser(mockUser, "token-for-local");

    expect(localStorage.getItem("bank_admin_token")).toBe("token-for-local");
  });

  it("logout 应该清除用户信息和 token", () => {
    // 先登录
    useAuthStore.getState().setUser(mockUser, "some-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // 再登出
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("logout 应该清除 localStorage 中的 token", () => {
    localStorage.setItem("bank_admin_token", "should-be-cleared");
    useAuthStore.getState().logout();

    expect(localStorage.getItem("bank_admin_token")).toBeNull();
  });

  it("多次调用 setUser 应该覆盖旧数据", () => {
    const user2: User = { ...mockUser, id: "u002", username: "operator" };

    useAuthStore.getState().setUser(mockUser, "token-1");
    useAuthStore.getState().setUser(user2, "token-2");

    const state = useAuthStore.getState();
    expect(state.user?.id).toBe("u002");
    expect(state.token).toBe("token-2");
  });
});