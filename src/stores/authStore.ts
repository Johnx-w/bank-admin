/**
 * 认证状态管理（Zustand）
 *
 * 管理用户登录状态、Token、用户信息。
 * setUser 和 logout 同时同步 localStorage，保证刷新页面后登录状态可恢复。
 *
 * 可扩展点：如需记住登录状态（持久化），在 setUser 中额外写入 sessionStorage。
 */
import { create } from "zustand";
import { getApi } from "../api/client";
import { clearStoredAuth, registerUnauthorizedHandler } from "../auth/session";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/user";
import { getPermissionsByRoleIds } from "../utils/permission";
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "../utils/constants";
import { usePermissionStore } from "./permissionStore";

interface AuthState {
  /** 当前登录用户信息，未登录时为 null */
  user: User | null;
  /** JWT Token，未登录时为 null */
  token: string | null;
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 是否已完成本地会话恢复 */
  isInitialized: boolean;
  /** 是否正在恢复会话 */
  isInitializing: boolean;

  /** 设置用户信息和 Token（登录成功时调用） */
  setUser: (user: User, token: string, refreshToken?: string) => void;
  /** 使用本地 Token 调用 /me 恢复用户 */
  bootstrapAuth: () => Promise<void>;
  /** 清除用户信息和 Token（登出时调用） */
  logout: () => void;
}

const storedToken = localStorage.getItem(TOKEN_KEY);

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isInitialized: false,
  isInitializing: false,

  setUser: (user, token, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set({
      user,
      token,
      isAuthenticated: true,
      isInitialized: true,
      isInitializing: false,
    });
  },

  bootstrapAuth: async () => {
    const state = useAuthStore.getState();
    if (state.isInitialized || state.isInitializing) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ token: null, isInitialized: true, isInitializing: false });
      return;
    }

    set({ token, isInitializing: true });

    /**
     * 带重试的 /me 调用。
     * MSW Service Worker 是异步启动的，首次加载时可能还未就绪，
     * 此时 /me 会收到 GitHub Pages 的 404 HTML 而非 JSON → 触发解析异常。
     * 重试最多 3 次，每次间隔 1s，给 MSW 足够的启动时间。
     * 只有收到明确的 HTTP 401 才认为 Token 真的过期。
     */
    let lastError: unknown;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await getApi<ApiResponse<User>>("/me");
        const user = response.data;
        const permissions =
          user.permissions?.length ? user.permissions : getPermissionsByRoleIds(user.roleIds);
        usePermissionStore.getState().setPermissions(permissions);
        set({
          user,
          token,
          isAuthenticated: true,
          isInitialized: true,
          isInitializing: false,
        });
        return; // 成功，直接返回
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { response?: { status?: number } })?.response?.status;
        // 明确的 401 → Token 真的无效，停止重试
        if (status === 401) break;
        // 网络错误 / 非 JSON 响应 → 可能是 MSW 还没就绪，等一下重试
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    // 所有重试耗尽或收到 401：清除本地会话，让用户重新登录
    console.warn("[Auth] bootstrapAuth 失败，清除会话", lastError);
    clearStoredAuth();
    usePermissionStore.getState().setPermissions([]);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
      isInitializing: false,
    });
  },

  logout: () => {
    clearStoredAuth();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
      isInitializing: false,
    });
  },
}));

registerUnauthorizedHandler(() => useAuthStore.getState().logout());

export { useAuthStore };