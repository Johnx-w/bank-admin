/**
 * 已完成待办页面
 *
 * 展示所有已标记为完成的自定义待办事项，
 * 支持"取消完成"和"永久删除"操作。
 *
 * 路由：/completed-todos
 */
import { useMemo, useEffect } from "react";
import { Card, Typography, List, Tag, Button, Empty, Space, Popconfirm } from "antd";
import { UndoOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTodoStore } from "../../stores/todoStore";
import { PRIORITY_OPTIONS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";
import { formatSmartDeadline } from "../../utils/format";
import type { TodoItem } from "../../types/dashboard";

export default function CompletedTodosPage() {
  const { customTodos, toggleComplete, deleteTodo, markCompletedViewed } = useTodoStore();

  /** 进入页面时标记已读，清除 Badge */
  useEffect(() => {
    markCompletedViewed();
  }, [markCompletedViewed]);

  /** 只展示已完成的 */
  const completedTodos = useMemo(
    () => customTodos.filter((t) => t.completed),
    [customTodos],
  );

  const priorityColor = (p: TodoItem["priority"]) =>
    PRIORITY_OPTIONS.find((o) => o.value === p)?.color || "default";

  return (
    <div>
      <div className="dashboard-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          ✅ 已完成待办
        </Typography.Title>
      </div>

      <Card styles={{ body: { padding: 12 } }}>
        {completedTodos.length === 0 ? (
          <Empty
            description="暂无已完成的待办事项"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={completedTodos}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="undo"
                    title="确定取消完成？"
                    description="该待办将重新显示在数据概览中"
                    onConfirm={() => toggleComplete(item.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" icon={<UndoOutlined />}>
                      取消完成
                    </Button>
                  </Popconfirm>,
                  <Popconfirm
                    key="delete"
                    title="确定删除？"
                    description="删除后不可恢复"
                    onConfirm={() => deleteTodo(item.id)}
                    okText="确定删除"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={priorityColor(item.priority)}>
                        {PRIORITY_OPTIONS.find((o) => o.value === item.priority)?.label}
                      </Tag>
                      <Typography.Text delete>{item.title}</Typography.Text>
                    </Space>
                  }
                  description={
                    <span>
                      截止：{formatSmartDeadline(item.deadline)}
                      {item.completedAt
                        ? ` · 完成于 ${formatDateTime(item.completedAt)}`
                        : ""}
                      {item.module ? ` · ${item.module}` : ""}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
