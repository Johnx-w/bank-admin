import type { ReactNode } from "react";
import { Empty, Button } from "antd";

interface EmptyStateProps {
  description?: string;
  /** 可选的操作按钮文本，不传则不显示按钮 */
  actionText?: string;
  onAction?: () => void;
  /** 自定义图标覆盖默认 */
  icon?: ReactNode;
}

/**
 * 空状态占位组件
 *
 * 当列表或内容区域无数据时展示友好的空状态提示，替代白屏。
 *
 * @example
 * <EmptyState description="暂无用户数据" actionText="新增用户" onAction={handleAdd} />
 */
export function EmptyState({ description = "暂无数据", actionText, onAction, icon }: EmptyStateProps) {
  return (
    <Empty
      image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
      description={description}
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
}