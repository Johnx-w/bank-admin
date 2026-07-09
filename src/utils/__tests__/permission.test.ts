/**
 * 权限工具函数单元测试
 *
 * 覆盖角色→权限码映射的各种场景。
 */
import { describe, it, expect } from "vitest";
import { getPermissionsByRoleIds } from "../permission";

describe("getPermissionsByRoleIds", () => {
  it("超级管理员（r01）应获取全部权限", () => {
    const perms = getPermissionsByRoleIds(["r01"]);
    expect(perms).toContain("dashboard:view");
    expect(perms).toContain("user:list");
    expect(perms).toContain("user:create");
    expect(perms).toContain("user:edit");
    expect(perms).toContain("user:delete");
    expect(perms).toContain("user:status");
    expect(perms).toContain("transaction:list");
    expect(perms).toContain("transaction:approve");
    expect(perms).toContain("account:list");
    expect(perms).toContain("account:detail");
    expect(perms).toContain("system:config");
    expect(perms).toContain("system:logs");
    expect(perms.length).toBe(12);
  });

  it("业务操作员（r02）应仅获取 user 和 dashboard 权限", () => {
    const perms = getPermissionsByRoleIds(["r02"]);
    expect(perms).toContain("dashboard:view");
    expect(perms).toContain("user:list");
    expect(perms).toContain("user:create");
    expect(perms).toContain("user:edit");
    expect(perms).toContain("user:delete");
    expect(perms).toContain("user:status");
    expect(perms).not.toContain("transaction:list");
    expect(perms).not.toContain("account:list");
    expect(perms.length).toBe(6);
  });

  it("审计员（r03）应获取交易和账户权限", () => {
    const perms = getPermissionsByRoleIds(["r03"]);
    expect(perms).toContain("dashboard:view");
    expect(perms).toContain("transaction:list");
    expect(perms).toContain("transaction:approve");
    expect(perms).toContain("account:list");
    expect(perms).toContain("account:detail");
    expect(perms).not.toContain("user:list");
    expect(perms.length).toBe(5);
  });

  it("只读用户（r04）应仅获取 dashboard 权限", () => {
    const perms = getPermissionsByRoleIds(["r04"]);
    expect(perms).toContain("dashboard:view");
    expect(perms.length).toBe(1);
  });

  it("空角色列表应返回空数组", () => {
    const perms = getPermissionsByRoleIds([]);
    expect(perms).toEqual([]);
  });

  it("无效角色 ID 应返回空数组", () => {
    const perms = getPermissionsByRoleIds(["invalid_role"]);
    expect(perms).toEqual([]);
  });

  it("多个角色应合并权限且去重", () => {
    const perms = getPermissionsByRoleIds(["r02", "r03"]);
    expect(perms).toContain("dashboard:view");
    expect(perms).toContain("user:list");
    expect(perms).toContain("transaction:list");
    // dashboard:view 应该只出现一次（去重）
    const dashboardCount = perms.filter((p) => p === "dashboard:view").length;
    expect(dashboardCount).toBe(1);
  });

  it("部分有效部分无效的角色列表应只返回有效角色的权限", () => {
    const perms = getPermissionsByRoleIds(["r02", "invalid"]);
    expect(perms).toContain("user:list");
    expect(perms.length).toBeGreaterThan(0);
  });
});