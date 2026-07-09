/** 权限点类型：菜单权限 | 操作权限 */
export type PermissionType = 'menu' | 'action';

/** 权限点 */
export interface Permission {
  id: string;
  name: string;
  label: string;        // 前端显示名称
  type: PermissionType;
  parentId: string | null;
  sort: number;
  /** 权限标识，格式如 user:list, user:create */
  code: string;
}

/** 权限树节点（配合 Ant Design Tree 组件） */
export interface PermissionNode {
  key: string;
  title: string;
  children?: PermissionNode[];
  /** 是否已选中（回应用户已有权限） */
  checked?: boolean;
}

/** 角色实体 */
export interface Role {
  id: string;
  name: string;
  code: string;         // 角色标识，如 admin / operator
  description: string;
  permissionIds: string[];
  userCount: number;    // 该角色下的用户数
  status: 'active' | 'disabled';
  createdAt: string;
}

/** 创建/更新角色表单 */
export interface RoleFormData {
  name: string;
  code: string;
  description: string;
  permissionIds: string[];
  status: 'active' | 'disabled';
}