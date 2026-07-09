/**
 * Axios 实例 — 全局唯一 HTTP 客户端
 *
 * 职责：
 * 1. 创建带默认配置的 Axios 实例
 * 2. 请求拦截器：自动注入 Authorization Token
 * 3. 响应拦截器：401 自动清除 Token、解包 response.data
 *
 * 可扩展点：如需刷新 Token 机制，在 401 拦截器中添加 refresh 逻辑。
 */
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY } from "../utils/constants";

/** 全局 Axios 实例 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

// ============================================================
// 请求拦截器
// ============================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 响应拦截器
// ============================================================
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一解包，调用方直接拿到业务数据
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地 token
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

/**
 * 类型安全的 GET 请求封装
 *
 * Axios 响应拦截器在运行时解包 response.data，但 TS 无法推断此转换。
 * 该封装确保返回值类型与运行时一致。
 */
export async function getApi<T>(url: string): Promise<T> {
  const res = await api.get(url);
  return res as unknown as T;
}

export async function postApi<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.post(url, data);
  return res as unknown as T;
}

export async function putApi<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.put(url, data);
  return res as unknown as T;
}

export async function patchApi<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.patch(url, data);
  return res as unknown as T;
}

export async function deleteApi<T>(url: string): Promise<T> {
  const res = await api.delete(url);
  return res as unknown as T;
}

export { api };
export default api;