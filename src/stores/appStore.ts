/**
 * 应用级状态管理（Zustand）
 *
 * 管理侧边栏折叠、主题切换、页面标题等全局 UI 状态。
 *
 * 可扩展点：新增全局 UI 状态（如全屏模式、多语言）直接在此 store 添加字段和 action。
 */
import { create } from "zustand";

type Theme = "light" | "dark";

interface AppState {
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 当前主题 */
  theme: Theme;
  /** 当前页面标题 */
  pageTitle: string;

  /** 切换侧边栏折叠状态 */
  toggleSidebar: () => void;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 设置页面标题 */
  setPageTitle: (title: string) => void;
}

const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: "light",
  pageTitle: "",

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  setPageTitle: (title) => set({ pageTitle: title }),
}));

export { useAppStore };