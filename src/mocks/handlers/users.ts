/**
 * 用户管理模块 MSW 请求处理器
 *
 * 模拟用户的增删改查和分页接口。
 * 可扩展点：新增筛选条件时在 case 中追加逻辑。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_USER_LIST } from "../data/users";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { User, UserFormData } from "../../types/user";

import { API_BASE_URL as API_PREFIX } from "../../utils/constants";
let users = [...MOCK_USER_LIST];
let nextId = 100;

export const userHandlers = [
  /** GET /api/users — 分页获取用户列表 */
  http.get(`${API_PREFIX}/users`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const status = url.searchParams.get("status");
    const keyword = url.searchParams.get("keyword");

    let filtered = [...users];
    if (status) filtered = filtered.filter((u) => u.status === status);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(kw) ||
          u.nickname.toLowerCase().includes(kw) ||
          u.email.toLowerCase().includes(kw)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return HttpResponse.json<ApiResponse<PaginatedData<User>>>(
      { code: 0, message: "ok", data: { list, total, page, pageSize } },
      { status: 200 }
    );
  }),

  /** GET /api/users/:id — 获取单个用户 */
  http.get(`${API_PREFIX}/users/:id`, async ({ params }) => {
    await delay(100);
    const user = users.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json<ApiResponse>({ code: 404, message: "用户不存在", data: null }, { status: 404 });
    }
    return HttpResponse.json<ApiResponse<User>>({ code: 0, message: "ok", data: user }, { status: 200 });
  }),

  /** POST /api/users — 新建用户 */
  http.post(`${API_PREFIX}/users`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as UserFormData;
    const newUser: User = {
      id: `u${nextId++}`,
      username: body.username,
      nickname: body.nickname,
      email: body.email,
      phone: body.phone,
      status: body.status,
      roleIds: body.roleIds,
      department: body.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    return HttpResponse.json<ApiResponse<User>>({ code: 0, message: "创建成功", data: newUser }, { status: 201 });
  }),

  /** PUT /api/users/:id — 更新用户 */
  http.put(`${API_PREFIX}/users/:id`, async ({ params, request }) => {
    await delay(200);
    const idx = users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return HttpResponse.json<ApiResponse>({ code: 404, message: "用户不存在", data: null }, { status: 404 });
    }
    const body = (await request.json()) as Partial<UserFormData>;
    users[idx] = { ...users[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json<ApiResponse<User>>({ code: 0, message: "更新成功", data: users[idx] }, { status: 200 });
  }),

  /** DELETE /api/users/:id — 删除用户 */
  http.delete(`${API_PREFIX}/users/:id`, async ({ params }) => {
    await delay(200);
    const idx = users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return HttpResponse.json<ApiResponse>({ code: 404, message: "用户不存在", data: null }, { status: 404 });
    }
    users.splice(idx, 1);
    return HttpResponse.json<ApiResponse>({ code: 0, message: "删除成功", data: null }, { status: 200 });
  }),

  /** PATCH /api/users/:id/status — 启用/禁用用户 */
  http.patch(`${API_PREFIX}/users/:id/status`, async ({ params, request }) => {
    await delay(200);
    const idx = users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return HttpResponse.json<ApiResponse>({ code: 404, message: "用户不存在", data: null }, { status: 404 });
    }
    const body = (await request.json()) as { status: User["status"] };
    users[idx] = { ...users[idx], status: body.status, updatedAt: new Date().toISOString() };
    return HttpResponse.json<ApiResponse<User>>({ code: 0, message: "状态已更新", data: users[idx] }, { status: 200 });
  }),
];