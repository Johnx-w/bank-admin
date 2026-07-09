/** 操作日志 */
export interface OperationLog {
  id: string;
  operator: string;
  operatorName: string;
  action: string;             // 操作类型，如 user.create / transaction.approve
  targetType: string;         // 操作对象类型
  targetId: string;
  detail: string;             // 操作详情
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/** 系统配置项 */
export interface SystemConfig {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

/** 菜单项（动态路由用） */
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  parentId: string | null;
  sort: number;
  permissionCode: string | null;  // 关联的权限码，null 表示公开
  children?: MenuItem[];
}