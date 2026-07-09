/** 用户状态枚举 */
export type UserStatus = 'active' | 'disabled' | 'locked';

/** 用户实体 */
export interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar?: string;
  status: UserStatus;
  roleIds: string[];
  department: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/** 创建/更新用户表单数据 */
export interface UserFormData {
  username: string;
  nickname: string;
  email: string;
  phone: string;
  password?: string;    // 新增时必填，编辑时不填表示不修改
  status: UserStatus;
  roleIds: string[];
  department: string;
}