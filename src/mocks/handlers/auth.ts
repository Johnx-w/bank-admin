/**
 * 认证模块 MSW 请求处理器
 *
 * 模拟登录认证、登出和当前用户信息接口。
 */
import { http, HttpResponse, delay } from "msw";
import { MOCK_USERS, MOCK_TOKEN } from "../data/auth";
import type { ApiResponse } from "../../types/api";
import type { User } from "../../types/user";

const API_PREFIX = "/api";

export const authHandlers = [
  /** POST /api/login — 登录验证 */
  http.post(`${API_PREFIX}/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { username?: string; password?: string };

    if (!body?.username || !body?.password) {
      return HttpResponse.json<ApiResponse>({
        code: 400,
        message: "用户名和密码不能为空",
        data: null,
      }, { status: 400 });
    }

    const user = MOCK_USERS.find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json<ApiResponse>({
        code: 401,
        message: "用户名或密码错误",
        data: null,
      }, { status: 401 });
    }

    // 分离密码，返回安全用户对象
    const { password: _, ...safeUser } = user;

    return HttpResponse.json<ApiResponse<{ user: User; token: string }>>(
      { code: 0, message: "登录成功", data: { user: safeUser, token: MOCK_TOKEN } },
      { status: 200 }
    );
  }),

  /** POST /api/logout — 登出 */
  http.post(`${API_PREFIX}/logout`, async () => {
    await delay(100);
    return HttpResponse.json<ApiResponse>(
      { code: 0, message: "已登出", data: null },
      { status: 200 }
    );
  }),

  /** GET /api/me — 获取当前登录用户信息 */
  http.get(`${API_PREFIX}/me`, async ({ request }) => {
    await delay(100);
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (token !== MOCK_TOKEN) {
      return HttpResponse.json<ApiResponse>({
        code: 401,
        message: "Token 无效或已过期",
        data: null,
      }, { status: 401 });
    }

    const user = MOCK_USERS[0];
    const { password: _, ...safeUser } = user;

    return HttpResponse.json<ApiResponse<User>>(
      { code: 0, message: "ok", data: safeUser },
      { status: 200 }
    );
  }),
];