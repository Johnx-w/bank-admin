/**
 * 角色管理模块 MSW 请求处理器
 *
 * 模拟角色的增删改查和分页接口。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_ROLES, MOCK_PERMISSIONS } from "../data/users";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { Role, RoleFormData } from "../../types/role";

const API_PREFIX = "/api";
let roles = [...MOCK_ROLES];

export const roleHandlers = [
  /** GET /api/roles — 分页获取角色列表 */
  http.get(`${API_PREFIX}/roles`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const status = url.searchParams.get("status");
    const keyword = url.searchParams.get("keyword");

    let filtered = [...roles];
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          r.code.toLowerCase().includes(kw)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return HttpResponse.json<ApiResponse<PaginatedData<Role>>>(
      { code: 0, message: "ok", data: { list, total, page, pageSize } },
      { status: 200 }
    );
  }),

  /** GET /api/roles/:id — 获取单个角色 */
  http.get(`${API_PREFIX}/roles/:id`, async ({ params }) => {
    await delay(100);
    const role = roles.find((r) => r.id === params.id);
    if (!role) {
      return HttpResponse.json<ApiResponse>(
        { code: 404, message: "角色不存在", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json<ApiResponse<Role>>(
      { code: 0, message: "ok", data: role },
      { status: 200 }
    );
  }),

  /** POST /api/roles — 新建角色 */
  http.post(`${API_PREFIX}/roles`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as RoleFormData;
    const newRole: Role = {
      id: "r" + String(roles.length + 1).padStart(2, "0"),
      name: body.name,
      code: body.code,
      description: body.description,
      permissionIds: body.permissionIds,
      status: body.status,
      userCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    roles.unshift(newRole);
    return HttpResponse.json<ApiResponse<Role>>(
      { code: 0, message: "创建成功", data: newRole },
      { status: 201 }
    );
  }),

  /** PUT /api/roles/:id — 更新角色 */
  http.put(`${API_PREFIX}/roles/:id`, async ({ params, request }) => {
    await delay(200);
    const idx = roles.findIndex((r) => r.id === params.id);
    if (idx === -1) {
      return HttpResponse.json<ApiResponse>(
        { code: 404, message: "角色不存在", data: null },
        { status: 404 }
      );
    }
    const body = (await request.json()) as Partial<RoleFormData>;
    roles[idx] = { ...roles[idx], ...body };
    return HttpResponse.json<ApiResponse<Role>>(
      { code: 0, message: "更新成功", data: roles[idx] },
      { status: 200 }
    );
  }),

  /** DELETE /api/roles/:id — 删除角色 */
  http.delete(`${API_PREFIX}/roles/:id`, async ({ params }) => {
    await delay(200);
    const idx = roles.findIndex((r) => r.id === params.id);
    if (idx === -1) {
      return HttpResponse.json<ApiResponse>(
        { code: 404, message: "角色不存在", data: null },
        { status: 404 }
      );
    }
    roles.splice(idx, 1);
    return HttpResponse.json<ApiResponse>(
      { code: 0, message: "删除成功", data: null },
      { status: 200 }
    );
  }),

  /** GET /api/permissions — 获取所有权限点 */
  http.get(`${API_PREFIX}/permissions`, async () => {
    await delay(100);
    const list = Object.values(MOCK_PERMISSIONS);
    return HttpResponse.json<ApiResponse<typeof list>>(
      { code: 0, message: "ok", data: list },
      { status: 200 }
    );
  }),
];
