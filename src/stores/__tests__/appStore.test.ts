import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../appStore";

describe("appStore", () => {
  beforeEach(() => {
    // 每个测试前重置 store
    useAppStore.setState({
      sidebarCollapsed: false,
      theme: "light",
      pageTitle: "",
    });
  });

  it("初始状态 sidebar 应为展开、主题为 light", () => {
    const { sidebarCollapsed, theme } = useAppStore.getState();
    expect(sidebarCollapsed).toBe(false);
    expect(theme).toBe("light");
  });

  it("toggleSidebar 应该折叠侧边栏", () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
  });

  it("两次 toggleSidebar 应该恢复展开", () => {
    useAppStore.getState().toggleSidebar();
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it("setTheme 应该切换主题", () => {
    useAppStore.getState().setTheme("dark");
    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("setTheme 支持 light 和 dark 两种值", () => {
    const themes: Array<"light" | "dark"> = ["dark", "light"];
    for (const t of themes) {
      useAppStore.getState().setTheme(t);
      expect(useAppStore.getState().theme).toBe(t);
    }
  });

  it("setPageTitle 应该更新页面标题", () => {
    useAppStore.getState().setPageTitle("用户管理");
    expect(useAppStore.getState().pageTitle).toBe("用户管理");
  });

  it("setPageTitle 允许设置空字符串", () => {
    useAppStore.getState().setPageTitle("测试");
    useAppStore.getState().setPageTitle("");
    expect(useAppStore.getState().pageTitle).toBe("");
  });
});