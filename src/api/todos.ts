/**
 * 待办事项 API 函数
 *
 * 当前为前端 Zustand store 的 API 外观层，
 * 后续接入真实后端时替换为实际的 HTTP 请求。
 */
import { getApi, postApi, patchApi, deleteApi } from './client';
import type { ApiResponse } from '../types/api';
import type { TodoItem } from '../types/dashboard';
import type { CreateTodoInput } from '../types/todo';

/** 获取已完成待办列表 */
export async function fetchCompletedTodos(): Promise<ApiResponse<TodoItem[]>> {
  return getApi<ApiResponse<TodoItem[]>>('/todos/completed');
}

/** 新增自定义待办 */
export async function createTodo(input: CreateTodoInput): Promise<ApiResponse<TodoItem>> {
  return postApi<ApiResponse<TodoItem>>('/todos', input);
}

/** 切换待办完成状态 */
export async function toggleTodoComplete(id: string): Promise<ApiResponse<TodoItem>> {
  return patchApi<ApiResponse<TodoItem>>(`/todos/${id}/complete`);
}

/** 删除待办 */
export async function deleteTodoById(id: string): Promise<ApiResponse<null>> {
  return deleteApi<ApiResponse<null>>(`/todos/${id}`);
}
