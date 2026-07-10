// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermission } from "../usePermission";
import { usePermissionStore } from "../../stores/permissionStore";

describe("usePermission", () => {
  beforeEach(() => {
    usePermissionStore.setState({ permissions: [] });
  });

  it("权限为空时返回 false", () => {
    const { result } = renderHook(() => usePermission("user:list"));
    expect(result.current).toBe(false);
  });

  it("存在的权限应返回 true", () => {
    usePermissionStore.setState({ permissions: ["user:list"] });
    const { result } = renderHook(() => usePermission("user:list"));
    expect(result.current).toBe(true);
  });

  it("不存在的权限应返回 false", () => {
    usePermissionStore.setState({ permissions: ["user:list"] });
    const { result } = renderHook(() => usePermission("role:list"));
    expect(result.current).toBe(false);
  });

  it("空字符串权限码应返回 false", () => {
    usePermissionStore.setState({ permissions: ["user:list"] });
    const { result } = renderHook(() => usePermission(""));
    expect(result.current).toBe(false);
  });

  it("权限更新后 hook 应反映新值", () => {
    const { result, rerender } = renderHook(
      (code: string) => usePermission(code),
      { initialProps: "user:list" }
    );
    expect(result.current).toBe(false);

    usePermissionStore.setState({ permissions: ["user:list"] });
    rerender("user:list");
    expect(result.current).toBe(true);
  });
});