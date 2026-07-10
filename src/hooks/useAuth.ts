/**
 * 认证状态 Hook
 *
 * 从 authStore 中读取和操作当前用户的认证信息。
 * 按字段独立订阅，减少 Zustand 的不必要重渲染。
 *
 * 规则依据：rerender-derived-state（isAuthenticated 为派生布尔值）、
 *           rerender-split-combined-hooks（各字段来自同一 store，无需拆分）
 *
 * @returns { user, token, isAuthenticated, setUser, logout }
 */
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  return { user, token, isAuthenticated, setUser, logout };
}