import { describe, it, expect, beforeEach } from "vitest";
import { usePermissionStore } from "../permissionStore";

describe("permissionStore", () => {
  beforeEach(() => {
    usePermissionStore.setState({ permissions: [] });
  });

  it("初始权限列表应为空", () => {
    expect(usePermissionStore.getState().permissions).toEqual([]);
  });

  it("setPermissions 应该更新权限列表", () => {
    const perms = ["user:list", "user:create", "role:list"];
    usePermissionStore.getState().setPermissions(perms);

    expect(usePermissionStore.getState().permissions).toEqual(perms);
  });

  it("setPermissions 支持空数组（无权限用户）", () => {
    usePermissionStore.getState().setPermissions([]);
    expect(usePermissionStore.getState().permissions).toEqual([]);
  });

  it("hasPermission 应该对存在的权限返回 true", () => {
    usePermissionStore.getState().setPermissions(["user:list", "user:create"]);

    expect(usePermissionStore.getState().hasPermission("user:list")).toBe(true);
    expect(usePermissionStore.getState().hasPermission("user:create")).toBe(true);
  });

  it("hasPermission 应该对不存在的权限返回 false", () => {
    usePermissionStore.getState().setPermissions(["user:list"]);

    expect(usePermissionStore.getState().hasPermission("role:list")).toBe(false);
  });

  it("hasPermission 应该在权限列表为空时始终返回 false", () => {
    usePermissionStore.getState().setPermissions([]);

    expect(usePermissionStore.getState().hasPermission("user:list")).toBe(false);
    expect(usePermissionStore.getState().hasPermission("any:thing")).toBe(false);
  });

  it("多次 setPermissions 应该覆盖而不是追加", () => {
    usePermissionStore.getState().setPermissions(["user:list"]);
    usePermissionStore.getState().setPermissions(["role:list"]);

    expect(usePermissionStore.getState().permissions).toEqual(["role:list"]);
    expect(usePermissionStore.getState().hasPermission("user:list")).toBe(false);
  });
});