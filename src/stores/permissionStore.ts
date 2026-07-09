/**
 * 权限状态管理（Zustand）
 *
 * 存储当前用户的权限点列表，提供 hasPermission 查询方法。
 * 权限点格式如 "user:list"、"transaction:approve"。
 *
 * 可扩展点：如需支持角色继承或权限缓存，在此 store 中添加对应逻辑。
 */
import { create } from "zustand";

interface PermissionState {
  /** 当前用户的权限点代码列表 */
  permissions: string[];

  /** 设置权限列表（登录或刷新权限时调用） */
  setPermissions: (permissions: string[]) => void;
  /** 判断当前用户是否拥有指定权限 */
  hasPermission: (code: string) => boolean;
}

const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],

  setPermissions: (permissions) => set({ permissions }),

  hasPermission: (code) => {
    return get().permissions.includes(code);
  },
}));

export { usePermissionStore };