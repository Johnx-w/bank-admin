/**
 * 认证状态管理（Zustand）
 *
 * 管理用户登录状态、Token、用户信息。
 * setUser 和 logout 同时同步 localStorage，保证刷新页面后登录状态可恢复。
 *
 * 可扩展点：如需记住登录状态（持久化），在 setUser 中额外写入 sessionStorage。
 */
import { create } from "zustand";
import type { User } from "../types/user";
import { TOKEN_KEY } from "../utils/constants";

interface AuthState {
  /** 当前登录用户信息，未登录时为 null */
  user: User | null;
  /** JWT Token，未登录时为 null */
  token: string | null;
  /** 是否已登录 */
  isAuthenticated: boolean;

  /** 设置用户信息和 Token（登录成功时调用） */
  setUser: (user: User, token: string) => void;
  /** 清除用户信息和 Token（登出时调用） */
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export { useAuthStore };