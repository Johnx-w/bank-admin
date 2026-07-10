/**
 * 系统管理模块 MSW 请求处理器
 *
 * 模拟操作日志查询和系统配置获取/保存接口。
 */
import { http, HttpResponse, delay } from "msw";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { OperationLog, SystemConfig } from "../../types/system";

const API_PREFIX = "/api";

/** Mock 操作日志 */
const MOCK_LOGS: OperationLog[] = [
  {
    id: "log001",
    operator: "u001",
    operatorName: "系统管理员",
    action: "user.create",
    targetType: "用户",
    targetId: "u004",
    detail: "创建了新用户 张三",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-10T09:30:00",
  },
  {
    id: "log002",
    operator: "u001",
    operatorName: "系统管理员",
    action: "user.status",
    targetType: "用户",
    targetId: "u002",
    detail: "启用用户 业务操作员",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-10T10:15:00",
  },
  {
    id: "log003",
    operator: "u002",
    operatorName: "业务操作员",
    action: "transaction.approve",
    targetType: "交易",
    targetId: "tx001",
    detail: "审核通过交易 TX20260710001",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-10T11:00:00",
  },
  {
    id: "log004",
    operator: "u003",
    operatorName: "审计员",
    action: "system.login",
    targetType: "系统",
    targetId: "",
    detail: "登录系统",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-10T08:00:00",
  },
  {
    id: "log005",
    operator: "u001",
    operatorName: "系统管理员",
    action: "system.config",
    targetType: "系统配置",
    targetId: "cfg001",
    detail: "修改了系统配置项 maxLoginAttempts",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-09T16:45:00",
  },
  {
    id: "log006",
    operator: "u002",
    operatorName: "业务操作员",
    action: "user.edit",
    targetType: "用户",
    targetId: "u001",
    detail: "更新了用户 admin 的部门信息",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-09T14:20:00",
  },
  {
    id: "log007",
    operator: "u003",
    operatorName: "审计员",
    action: "account.view",
    targetType: "账户",
    targetId: "acc001",
    detail: "查看了账户 622202****7890 的详情",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-09T11:30:00",
  },
  {
    id: "log008",
    operator: "u001",
    operatorName: "系统管理员",
    action: "role.create",
    targetType: "角色",
    targetId: "r05",
    detail: "创建了角色 数据观察员",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    createdAt: "2026-07-08T09:00:00",
  },
];

/** Mock 系统配置项 */
const MOCK_CONFIG: SystemConfig[] = [
  {
    key: "maxLoginAttempts",
    value: "5",
    description: "最大登录尝试次数",
    updatedAt: "2026-07-09T16:45:00",
    updatedBy: "系统管理员",
  },
  {
    key: "sessionTimeout",
    value: "1800",
    description: "会话超时时间（秒）",
    updatedAt: "2026-06-01T00:00:00",
    updatedBy: "系统管理员",
  },
  {
    key: "auditRetentionDays",
    value: "365",
    description: "审计日志保留天数",
    updatedAt: "2026-06-01T00:00:00",
    updatedBy: "系统管理员",
  },
  {
    key: "autoFreezeThreshold",
    value: "3",
    description: "连续失败次数后自动冻结",
    updatedAt: "2026-06-01T00:00:00",
    updatedBy: "系统管理员",
  },
];

export const systemHandlers = [
  /** GET /api/settings/logs — 分页获取操作日志 */
  http.get(`${API_PREFIX}/settings/logs`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const type = url.searchParams.get("type");
    const keyword = url.searchParams.get("keyword");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let filtered = [...MOCK_LOGS];
    if (type) filtered = filtered.filter((l) => l.action.startsWith(type));
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.operatorName.toLowerCase().includes(kw) ||
          l.detail.toLowerCase().includes(kw)
      );
    }
    if (startDate) filtered = filtered.filter((l) => l.createdAt >= startDate);
    if (endDate) filtered = filtered.filter((l) => l.createdAt <= endDate + "T23:59:59");

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return HttpResponse.json<ApiResponse<PaginatedData<OperationLog>>>(
      { code: 0, message: "ok", data: { list, total, page, pageSize } },
      { status: 200 }
    );
  }),

  /** GET /api/settings/config — 获取系统配置 */
  http.get(`${API_PREFIX}/settings/config`, async () => {
    await delay(200);
    return HttpResponse.json<ApiResponse<SystemConfig[]>>(
      { code: 0, message: "ok", data: MOCK_CONFIG },
      { status: 200 }
    );
  }),

  /** PUT /api/settings/config — 保存系统配置 */
  http.put(`${API_PREFIX}/settings/config`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as SystemConfig[];
    return HttpResponse.json<ApiResponse<SystemConfig[]>>(
      { code: 0, message: "配置已保存", data: body },
      { status: 200 }
    );
  }),
];
