import { HashRouter } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { themeConfig, darkThemeConfig } from "./styles/theme";
import { useAppStore } from "./stores/appStore";
import AppRouter from "./router";

/**
 * 应用根组件
 *
 * 全局 Provider 层级：
 * ErrorBoundary（捕获渲染异常）> ConfigProvider（Ant Design 主题 + 国际化）> BrowserRouter（路由）
 *
 * 主题通过 appStore.theme 动态切换 light/dark，
 * ConfigProvider 的 theme prop 接受 ThemeConfig，algorithm 控制模式。
 */
export default function App() {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === "dark";

  const mergedTheme = isDark
    ? { ...darkThemeConfig, algorithm: antdTheme.darkAlgorithm }
    : themeConfig;

  return (
    <ErrorBoundary>
      <ConfigProvider theme={mergedTheme} locale={zhCN}>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}