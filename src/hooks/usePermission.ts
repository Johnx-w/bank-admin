/**
 * 权限判断 Hook
 *
 * 根据权限码判断当前用户是否拥有对应权限。
 * 单字段订阅，最小化重渲染影响。
 *
 * 规则依据：rerender-derived-state（hasPermission 返回布尔值）
 *
 * @param code - 权限码，如 "user:list"
 * @returns boolean
 *
 * @example
 * const canCreate = usePermission("user:create");
 * {canCreate && <Button>新增用户</Button>}
 */
import { usePermissionStore } from "../stores/permissionStore";

export function usePermission(code: string): boolean {
  return usePermissionStore((s) => s.hasPermission(code));
}