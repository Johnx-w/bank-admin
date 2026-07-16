/**
 * 待办事项模块类型定义
 *
 * 扩展自 dashboard.ts 中的 TodoItem，新增创建输入和自动待办相关类型。
 */

import type { TodoItem } from './dashboard';

/** 创建自定义待办的输入参数 */
export interface CreateTodoInput {
  title: string;
  priority: TodoItem['priority'];
  deadline: string;
  module?: string;
}

/** 自动生成的待办来源类型 */
export type AutoTodoSource = 'pending_audit' | 'anomaly_warning';

/** 自动待办配置：当对应数量 > 0 时自动生成待办项 */
export interface AutoTodoConfig {
  source: AutoTodoSource;
  titleTemplate: (count: number) => string;
  priority: TodoItem['priority'];
  module: string;
  navigateTo: string;
}
