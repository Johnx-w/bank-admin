import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { startWorker } from "./mocks/browser";
import "./styles/index.css";

/**
 * 应用入口
 *
 * 先渲染 React 应用，MSW 在后台异步启动。
 * 这样即使 Service Worker 首次注册较慢（GitHub Pages CDN 延迟），
 * 页面也能立即展示，不会白屏。
 * API 请求在 MSW 就绪前会走真实网络（404），
 * MSW 就绪后自动接管拦截，页面数据随之出现。
 */
function bootstrap() {
  const root = document.getElementById("root");
  if (!root) throw new Error("Root element not found");

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // MSW 后台启动，不阻塞渲染
  // 首次访问时 Service Worker 下载/安装/激活可能需要数秒，
  // 但页面已正常显示，用户不会看到白屏
  startWorker();
}

bootstrap();