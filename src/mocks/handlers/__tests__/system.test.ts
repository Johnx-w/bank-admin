// @vitest-environment jsdom
/**
 * 系统管理 MSW Handler 单元测试
 */
import { describe, it, expect } from "vitest";
import { systemHandlers } from "../system";

describe("systemHandlers", () => {
  it("应包含 4 个 handler（PING, GET logs, GET config, PUT config）", () => {
    expect(systemHandlers).toHaveLength(4);
  });

  it("每个 handler 的 info.method 和 info.path 应正确", () => {
    const infoMap = systemHandlers.map((h) => ({
      method: h.info.method,
      path: String(h.info.path),
    }));

    const logHandler = infoMap.find(
      (i) => i.method === "GET" && i.path === "/api/settings/logs"
    );
    expect(logHandler).toBeDefined();

    const configGetHandler = infoMap.find(
      (i) => i.method === "GET" && i.path === "/api/settings/config"
    );
    expect(configGetHandler).toBeDefined();

    const configPutHandler = infoMap.find(
      (i) => i.method === "PUT" && i.path === "/api/settings/config"
    );
    expect(configPutHandler).toBeDefined();
  });
});
