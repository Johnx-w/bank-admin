/**
 * 用户管理 API 函数
 *
 * 封装所有用户相关的 HTTP 请求，统一处理分页参数序列化和类型标注。
 */
import { getApi, postApi, putApi, deleteApi, patchApi } from "./client";
import type { ApiResponse, PaginatedData } from "../types/api";
import type { User, UserFormData } from "../types/user";

/** 用户列表查询参数 */
export interface UserListParams {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}

/** 获取用户分页列表 */
export async function fetchUserList(
  params: UserListParams
): Promise<ApiResponse<PaginatedData<User>>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.keyword) query.set("keyword", params.keyword);
  return getApi<ApiResponse<PaginatedData<User>>>("/users?" + query.toString());
}

/** 获取单个用户 */
export async function fetchUserById(id: string): Promise<ApiResponse<User>> {
  return getApi<ApiResponse<User>>("/users/" + id);
}

/** 新建用户 */
export async function createUser(data: UserFormData): Promise<ApiResponse<User>> {
  return postApi<ApiResponse<User>>("/users", data);
}

/** 更新用户 */
export async function updateUser(
  id: string,
  data: Partial<UserFormData>
): Promise<ApiResponse<User>> {
  return putApi<ApiResponse<User>>("/users/" + id, data);
}

/** 删除用户 */
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  return deleteApi<ApiResponse<null>>("/users/" + id);
}

/** 变更用户状态（启用/禁用） */
export async function updateUserStatus(
  id: string,
  status: User["status"]
): Promise<ApiResponse<User>> {
  return patchApi<ApiResponse<User>>("/users/" + id + "/status", { status });
}
