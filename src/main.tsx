import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { startWorker } from "./mocks/browser";
import "./styles/index.css";

/**
 * 应用入口
 *
 * 先启动 MSW Mock Service Worker，再渲染 React 应用。
 * MSW 启动失败时不会阻塞渲染（浏览器兼容性问题），
 * 无网络拦截时页面可以正常展示但数据为空。
 */
async function bootstrap() {
  // 仅在开发环境启动 MSW
  if (import.meta.env.DEV) {
    await startWorker();
  }

  const root = document.getElementById("root");
  if (!root) throw new Error("Root element not found");

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();