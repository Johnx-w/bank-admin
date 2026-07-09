/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;       // 0 = 成功，非 0 = 错误
  message: string;    // 提示信息
  data: T;
}

/** 分页请求参数 */
export interface PageParams {
  page: number;
  pageSize: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向：ascend | descend */
  sortOrder?: string;
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 分页响应（包裹在 ApiResponse 中） */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;