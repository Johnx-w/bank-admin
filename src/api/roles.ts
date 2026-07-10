/**
 * 角色管理 API 函数
 *
 * 封装角色列表查询、详情查询、新增、编辑、删除等接口。
 */
import { getApi, postApi, putApi, deleteApi } from "./client";
import type { ApiResponse, PaginatedData } from "../types/api";
import type { Role, RoleFormData } from "../types/role";

/** 角色列表查询参数 */
export interface RoleListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}

/** 获取角色分页列表 */
export async function fetchRoleList(
  params: RoleListParams
): Promise<ApiResponse<PaginatedData<Role>>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.keyword) query.set("keyword", params.keyword);
  return getApi<ApiResponse<PaginatedData<Role>>>("/roles?" + query.toString());
}

/** 获取单个角色 */
export async function fetchRoleById(id: string): Promise<ApiResponse<Role>> {
  return getApi<ApiResponse<Role>>("/roles/" + id);
}

/** 新建角色 */
export async function createRole(
  data: RoleFormData
): Promise<ApiResponse<Role>> {
  return postApi<ApiResponse<Role>>("/roles", data);
}

/** 更新角色 */
export async function updateRole(
  id: string,
  data: Partial<RoleFormData>
): Promise<ApiResponse<Role>> {
  return putApi<ApiResponse<Role>>("/roles/" + id, data);
}

/** 删除角色 */
export async function deleteRole(id: string): Promise<ApiResponse<null>> {
  return deleteApi<ApiResponse<null>>("/roles/" + id);
}
