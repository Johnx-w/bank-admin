/**
 * 待办事项状态管理（Zustand）
 *
 * 管理自定义待办的 CRUD 和自动待办（待审核/异常告警）的动态计数。
 *
 * 设计原则：
 *   - 自定义待办（用户手动创建）在 store 中持久化
 *   - 自动待办（待审核/异常告警）由外部传入计数动态生成，不存储在 store
 *   - 已完成状态仅在自定义待办上生效；自动待办由计数控制显隐
 *
 * 可扩展点：后续接入后端时，将 addTodo / toggleComplete / deleteTodo 改为调用 API。
 */
import { create } from 'zustand';
import type { TodoItem } from '../types/dashboard';
import type { CreateTodoInput } from '../types/todo';

/** 生成唯一 ID */
function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface TodoState {
  /** 用户手动创建的自定义待办 */
  customTodos: TodoItem[];

  /** 待审核交易数量（自动待办用） */
  pendingAuditCount: number;

  /** 异常告警数量（自动待办用） */
  anomalyCount: number;

  /** 上次查看已完成待办的时间戳（Badge 已读机制） */
  lastViewedCompletedAt: string | null;

  // ---- Actions ----

  /** 新增自定义待办 */
  addTodo: (input: CreateTodoInput) => void;

  /** 切换待办完成状态（仅自定义待办） */
  toggleComplete: (id: string) => void;

  /** 删除自定义待办 */
  deleteTodo: (id: string) => void;

  /** 更新自动待办计数（由 Dashboard 或交易页调用） */
  setAutoCounts: (pendingAudit: number, anomalyCount: number) => void;

  /** 标记已完成待办为已读（进入已完成页面时调用） */
  markCompletedViewed: () => void;
}

const useTodoStore = create<TodoState>((set) => ({
  customTodos: [],
  pendingAuditCount: 0,
  anomalyCount: 0,
  lastViewedCompletedAt: null,

  addTodo: (input) =>
    set((state) => {
      const newTodo: TodoItem = {
        id: generateId(),
        title: input.title,
        priority: input.priority,
        deadline: input.deadline,
        module: input.module || '',
        completed: false,
      };
      return { customTodos: [...state.customTodos, newTodo] };
    }),

  toggleComplete: (id) =>
    set((state) => {
      const now = new Date().toISOString();
      return {
        customTodos: state.customTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: !todo.completed,
                completedAt: !todo.completed ? now : undefined,
              }
            : todo,
        ),
      };
    }),

  deleteTodo: (id) =>
    set((state) => ({
      customTodos: state.customTodos.filter((todo) => todo.id !== id),
    })),

  setAutoCounts: (pendingAudit, anomalyCount) =>
    set({ pendingAuditCount: pendingAudit, anomalyCount }),

  markCompletedViewed: () =>
    set({ lastViewedCompletedAt: new Date().toISOString() }),
}));

export { useTodoStore };
