// @vitest-environment jsdom
/**
 * 角色管理 MSW Handler 单元测试
 *
 * 规则依据：instructions.md 第 1-10 条测试规范
 */
import { describe, it, expect, beforeAll } from "vitest";
import { http } from "msw";

// 由于 MSW handler 内部使用模块级变量（闭包状态），
// 这里测试 handler 函数的请求/响应匹配逻辑。
// MSW 实际的集成测试更适合在 E2E 层面完成。
// 本测试关注 handler 数组结构和路由模式。

import { roleHandlers } from "../roles";

describe("roleHandlers", () => {
  it("应包含 6 个 handler（GET list, GET detail, POST, PUT, DELETE, GET permissions）", () => {
    expect(roleHandlers).toHaveLength(6);
  });

  it("每个 handler 的 info.method 和 info.path 应正确", () => {
    const infoMap = roleHandlers.map((h) => ({
      method: h.info.method,
      path: String(h.info.path),
    }));

    // GET /api/roles
    const listHandler = infoMap.find(
      (i) => i.method === "GET" && i.path === "/api/roles"
    );
    expect(listHandler).toBeDefined();

    // GET /api/roles/:id
    const detailHandler = infoMap.find(
      (i) => i.method === "GET" && i.path === "/api/roles/:id"
    );
    expect(detailHandler).toBeDefined();

    // POST /api/roles
    const createHandler = infoMap.find(
      (i) => i.method === "POST" && i.path === "/api/roles"
    );
    expect(createHandler).toBeDefined();

    // PUT /api/roles/:id
    const updateHandler = infoMap.find(
      (i) => i.method === "PUT" && i.path === "/api/roles/:id"
    );
    expect(updateHandler).toBeDefined();

    // DELETE /api/roles/:id
    const deleteHandler = infoMap.find(
      (i) => i.method === "DELETE" && i.path === "/api/roles/:id"
    );
    expect(deleteHandler).toBeDefined();

    // GET /api/permissions
    const permHandler = infoMap.find(
      (i) => i.method === "GET" && i.path === "/api/permissions"
    );
    expect(permHandler).toBeDefined();
  });
});
