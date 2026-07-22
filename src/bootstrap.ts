let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let workerStarted = false;

const PING_URL = `${import.meta.env.BASE_URL}api/ping`;
const KEEP_ALIVE_MS = 30_000; // 每 30 秒心跳一次，避免浏览器休眠 Service Worker

export function shouldUseMsw(value = import.meta.env.VITE_USE_MSW): boolean {
  return value !== "false";
}

/**
 * 发送心跳请求检查 MSW Service Worker 是否存活。
 * 若请求失败（SW 已被浏览器休眠），自动重启 MSW。
 */
async function pingAndRevive(): Promise<void> {
  try {
    const res = await fetch(PING_URL, { method: "HEAD", cache: "no-store" });
    if (!res.ok) throw new Error(`ping ${res.status}`);
  } catch {
    console.warn("[MSW] Service Worker 失活，正在重新启动…");
    const { startWorker } = await import("./mocks/browser");
    await startWorker();
    console.log("[MSW] Service Worker 已恢复");
  }
}

function startKeepAlive(): void {
  stopKeepAlive();
  keepAliveTimer = setInterval(pingAndRevive, KEEP_ALIVE_MS);
}

function stopKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

export async function startMocking(): Promise<void> {
  if (!shouldUseMsw()) return;
  if (workerStarted) return;

  const { startWorker } = await import("./mocks/browser");
  await startWorker();
  workerStarted = true;

  // 心跳保活：每 30 秒发一次请求，防止浏览器空闲时休眠 Service Worker
  startKeepAlive();

  // 页面切回时立即检查：用户离开标签页再回来时，SW 可能已被休眠
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void pingAndRevive();
    }
  });
}
