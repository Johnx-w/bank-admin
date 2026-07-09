/**
 * 权限工具函数
 *
 * 根据角色 ID 列表计算对应的权限码集合。
 * 映射关系硬编码在此文件中，不依赖 mock 层。
 *
 * @param roleIds - 角色 ID 数组
 * @returns 权限码字符串数组
 */
export function getPermissionsByRoleIds(roleIds: string[]): string[] {
  /** 角色 ID 到权限码的映射 */
  const ROLE_PERMISSION_MAP: Record<string, string[]> = {
    r01: [
      "dashboard:view",
      "user:list",
      "user:create",
      "user:edit",
      "user:delete",
      "user:status",
      "transaction:list",
      "transaction:approve",
      "account:list",
      "account:detail",
      "system:config",
      "system:logs",
    ],
    r02: [
      "dashboard:view",
      "user:list",
      "user:create",
      "user:edit",
      "user:delete",
      "user:status",
    ],
    r03: [
      "dashboard:view",
      "transaction:list",
      "transaction:approve",
      "account:list",
      "account:detail",
    ],
    r04: ["dashboard:view"],
  };

  if (!roleIds || roleIds.length === 0) return [];

  const permissionSet = new Set<string>();
  for (const roleId of roleIds) {
    const permissions = ROLE_PERMISSION_MAP[roleId];
    if (permissions) {
      for (const perm of permissions) {
        permissionSet.add(perm);
      }
    }
  }
  return Array.from(permissionSet);
}