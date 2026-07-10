import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// 在所有 import 之前 mock axios
const mockRequestInterceptor = { fulfilled: null as unknown, rejected: null as unknown };
const mockResponseInterceptor = { fulfilled: null as unknown, rejected: null as unknown };
const mockAxiosInstance = {
  defaults: { baseURL: "", timeout: 0 },
  interceptors: {
    request: { use: (f: unknown, r: unknown) => { mockRequestInterceptor.fulfilled = f; mockRequestInterceptor.rejected = r; } },
    response: { use: (f: unknown, r: unknown) => { mockResponseInterceptor.fulfilled = f; mockResponseInterceptor.rejected = r; } },
  },
  get: vi.fn(),
  post: vi.fn(),
};

/** 捕获 axios.create 被调用时传入的配置 */
let capturedCreateConfig: Record<string, unknown> | undefined;

vi.mock("axios", () => ({
  default: {
    create: vi.fn((config?: Record<string, unknown>) => {
      capturedCreateConfig = config;
      if (config) {
        mockAxiosInstance.defaults = { ...mockAxiosInstance.defaults, ...config };
      }
      return mockAxiosInstance;
    }),
  },
}));

describe("api/client.ts", () => {
  beforeAll(async () => {
    // 只 import 一次，注册拦截器；后续测试复用，不再重新 import
    await import("../client");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("应该使用正确的 baseURL 和超时配置创建 Axios 实例", () => {
    expect(capturedCreateConfig).toBeDefined();
    expect(typeof capturedCreateConfig?.baseURL).toBe("string");
    expect(capturedCreateConfig?.baseURL).toBeTruthy();
    expect(capturedCreateConfig?.timeout).toBeGreaterThan(0);
  });

  it("请求拦截器应该在 localStorage 有 token 时注入 Authorization 头", async () => {
    const token = "test-jwt-token";
    localStorage.setItem("bank_admin_token", token);

    const config = { headers: { common: {} } } as any;
    const result = await (mockRequestInterceptor.fulfilled as Function)(config);
    expect(result.headers.Authorization).toBe("Bearer " + token);
  });

  it("请求拦截器应该在 localStorage 无 token 时不添加 Authorization 头", async () => {
    const config = { headers: { common: {} } } as any;
    const result = await (mockRequestInterceptor.fulfilled as Function)(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("请求拦截器应该透传其他请求头", async () => {
    const config = { headers: { common: { "X-Custom": "test" } } } as any;
    const result = await (mockRequestInterceptor.fulfilled as Function)(config);
    expect(result.headers.common["X-Custom"]).toBe("test");
  });

  it("响应拦截器应该在 401 错误时清除 token 并拒绝", async () => {
    localStorage.setItem("bank_admin_token", "should-be-removed");
    const error = {
      response: { status: 401, data: { message: "Unauthorized" } },
    };

    await expect((mockResponseInterceptor.rejected as Function)(error)).rejects.toThrow();

    // 验证 localStorage 中的 token 已被清除
    expect(localStorage.getItem("bank_admin_token")).toBeNull();
  });

  it("响应拦截器应该透传非 401 错误", async () => {
    const error = {
      response: { status: 500, data: { message: "Server Error" } },
    };

    await expect((mockResponseInterceptor.rejected as Function)(error)).rejects.toThrow();
  });

  it("响应拦截器应该在网络错误（无 response）时正确拒绝", async () => {
    const error = {
      message: "Network Error",
      code: "ECONNABORTED",
    };

    await expect((mockResponseInterceptor.rejected as Function)(error)).rejects.toEqual(error);
  });

  it("响应拦截器应该解包成功响应的 data 字段", async () => {
    const response = { data: { code: 0, data: "ok", message: "success" }, status: 200 };
    const result = await (mockResponseInterceptor.fulfilled as Function)(response);
    // 标准 API 客户端会在响应拦截器中 return response.data，调用方直接拿到业务数据
    expect(result).toBe(response.data);
  });
});