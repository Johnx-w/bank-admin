/**
 * MSW 浏览器端启动配置
 */

import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { userHandlers } from "./handlers/users";
import { dashboardHandlers } from "./handlers/dashboard";
import { transactionHandlers } from "./handlers/transactions";
import { accountHandlers } from "./handlers/accounts";
import { roleHandlers } from "./handlers/roles";
import { systemHandlers } from "./handlers/system";

/** 所有 MSW 请求处理器 */
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...dashboardHandlers,
  ...transactionHandlers,
  ...accountHandlers,
  ...roleHandlers,
  ...systemHandlers,
];

const worker = setupWorker(...handlers);

export async function startWorker(): Promise<void> {
  if (import.meta.env.PROD) return;
  try {
    await worker.start({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
    console.log("[MSW] Mock Service Worker started");
  } catch (error) {
    console.warn("[MSW] Failed to start:", error);
  }
}
