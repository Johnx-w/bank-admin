import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Row, Col, Card, Typography, Button, List, Tag, Checkbox,
  Modal, Form, Input, Select, DatePicker, Empty, Tooltip,
} from "antd";
import {
  ReloadOutlined, PlusOutlined, ExclamationCircleOutlined,
  AuditOutlined, DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getApi } from "../../api/client";
import { StatCard } from "../../components/StatCard";
import { PageLoading } from "../../components/PageLoading";
import type { ApiResponse } from "../../types/api";
import type { DashboardData, TodoItem } from "../../types/dashboard";
import type { CreateTodoInput } from "../../types/todo";
import { PRIORITY_OPTIONS } from "../../utils/constants";
import { formatSmartDeadline } from "../../utils/format";
import { useTodoStore } from "../../stores/todoStore";

/**
 * 仪表盘页面
 *
 * 展示统计数据卡片和待办事项。
 * 待办事项 = 自动待办（待审核/异常告警）+ 静态待办（API）+ 自定义待办（用户创建）。
 *
 * 规则依据：
 *   rerender-derived-state-no-effect（自动待办在渲染时推导）
 *   error-handling（异步操作 try-catch + 友好提示）
 *   js-early-exit（未加载完时显示 loading）
 *   rerender-memo（回调 + 派生数据记忆化）
 */

/** 自动待办配置 */
const AUTO_TODO_CONFIGS = [
  {
    source: 'pending_audit' as const,
    icon: <AuditOutlined />,
    titleTemplate: (n: number) => `审核待处理交易 ${n} 笔`,
    module: '交易管理',
    navigateTo: '/transactions',
  },
  {
    source: 'anomaly_warning' as const,
    icon: <ExclamationCircleOutlined />,
    titleTemplate: (n: number) => `处理 ${n} 条大额异常交易`,
    module: '风险监控',
    navigateTo: '/transactions',
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateTodoInput>();
  const navigate = useNavigate();

  const {
    customTodos,
    pendingAuditCount,
    anomalyCount,
    addTodo,
    toggleComplete,
    deleteTodo,
    setAutoCounts,
  } = useTodoStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getApi<ApiResponse<DashboardData>>("/dashboard");
      const dashboardData = response.data;
      setData(dashboardData);
      // 同步自动待办计数到 store
      setAutoCounts(dashboardData.stats.pendingAudit, dashboardData.stats.anomalyCount);
    } catch {
      setError("数据加载失败，请检查后端服务是否正常运行");
    } finally {
      setLoading(false);
    }
  }, [setAutoCounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** 生成自动待办（来自 pendingAudit / anomalyCount） */
  const autoTodos = useMemo<TodoItem[]>(() => {
    const counts: Record<string, number> = {
      pending_audit: pendingAuditCount,
      anomaly_warning: anomalyCount,
    };
    return AUTO_TODO_CONFIGS
      .filter((cfg) => counts[cfg.source] > 0)
      .map((cfg) => ({
        id: `auto_${cfg.source}`,
        title: cfg.titleTemplate(counts[cfg.source]),
        priority: 'high' as const,
        deadline: dayjs().add(1, 'day').hour(18).minute(0).second(0).format('YYYY-MM-DD HH:mm'),
        module: cfg.module,
        completed: false,
      }));
  }, [pendingAuditCount, anomalyCount]);

  /** 活跃的自定义待办（未完成） */
  const activeCustomTodos = useMemo(
    () => customTodos.filter((t) => !t.completed),
    [customTodos],
  );

  /** 所有活跃待办：自动 + API 静态 + 自定义 */
  const activeTodos = useMemo<TodoItem[]>(() => {
    const apiTodos = (data?.todos || []).filter((t) => !t.completed);
    return [...autoTodos, ...apiTodos, ...activeCustomTodos];
  }, [autoTodos, data?.todos, activeCustomTodos]);

  /** 紧急程度 Tag 颜色 */
  const priorityColor = useCallback(
    (p: TodoItem["priority"]) =>
      PRIORITY_OPTIONS.find((o) => o.value === p)?.color || "default",
    [],
  );

  /** 是否自动待办 */
  const isAutoTodo = useCallback((id: string) => id.startsWith("auto_"), []);

  /** 点击自动待办跳转 */
  const handleAutoTodoClick = useCallback(
    (item: TodoItem) => {
      const cfg = AUTO_TODO_CONFIGS.find((c) => `auto_${c.source}` === item.id);
      if (cfg) navigate(cfg.navigateTo);
    },
    [navigate],
  );

  /** 提交新增待办 */
  const handleAddTodo = useCallback(() => {
    form.validateFields().then((values) => {
      addTodo({
        title: values.title,
        priority: values.priority,
        deadline: dayjs(values.deadline).format("YYYY-MM-DD HH:mm"),
        module: values.module,
      });
      form.resetFields();
      setModalOpen(false);
    });
  }, [form, addTodo]);

  if (error) {
    return (
      <Card>
        <Typography.Text type="danger">{error}</Typography.Text>
        <br />
        <Button onClick={fetchData} style={{ marginTop: 8 }}>重试</Button>
      </Card>
    );
  }

  if (loading || !data) {
    return <PageLoading />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          📊 数据概览
        </Typography.Title>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={fetchData}>
          刷新
        </Button>
      </div>

      {/* 统计卡片行 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="总用户数" value={data.stats.totalUsers} color="#1677ff" icon="👥" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="今日交易" value={data.stats.todayTransactions} color="#52c41a" icon="💳" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="待审核"
            value={data.stats.pendingAudit}
            color="#faad14"
            icon="📋"
            onClick={() => navigate("/transactions")}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="异常告警"
            value={data.stats.anomalyCount}
            color="#ff4d4f"
            icon="🚨"
            onClick={() => navigate("/transactions")}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 待办事项 */}
        <Col xs={24} lg={8}>
          <Card
            title="📌 待办事项"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                新增待办
              </Button>
            }
            styles={{ body: { padding: 12 } }}
          >
            {activeTodos.length === 0 ? (
              <Empty description="暂无待办事项" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={activeTodos}
                renderItem={(item) => {
                  const isAuto = isAutoTodo(item.id);
                  const isCustom = item.id.startsWith("custom_");
                  return (
                    <List.Item
                      actions={
                        isCustom
                          ? [
                              <Tooltip title="删除" key="del">
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTodo(item.id);
                                  }}
                                />
                              </Tooltip>,
                            ]
                          : undefined
                      }
                    >
                      <Checkbox
                        checked={item.completed}
                        disabled={isAuto}
                        onChange={() => {
                          if (!isAuto) toggleComplete(item.id);
                        }}
                        style={{ marginRight: 8 }}
                      />
                      <List.Item.Meta
                        title={
                          <span
                            style={{ cursor: isAuto ? "pointer" : "default" }}
                            onClick={() => isAuto && handleAutoTodoClick(item)}
                          >
                            {isAuto && AUTO_TODO_CONFIGS.find(
                              (c) => `auto_${c.source}` === item.id,
                            )?.icon}{" "}
                            <Tag color={priorityColor(item.priority)}>
                              {PRIORITY_OPTIONS.find((o) => o.value === item.priority)?.label}
                            </Tag>
                            {item.title}
                          </span>
                        }
                        description={`截止：${formatSmartDeadline(item.deadline)}${isAuto ? " · 系统自动生成" : ""}`}
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 新增待办弹窗 */}
      <Modal
        title="新增待办事项"
        open={modalOpen}
        onOk={handleAddTodo}
        onCancel={() => {
          form.resetFields();
          setModalOpen(false);
        }}
        okText="确认添加"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入待办标题" }]}
          >
            <Input placeholder="例如：审核大额交易申请" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="priority"
            label="紧急程度"
            rules={[{ required: true, message: "请选择紧急程度" }]}
            initialValue="medium"
          >
            <Select
              options={PRIORITY_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="截止日期"
            rules={[{ required: true, message: "请选择截止日期" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              style={{ width: "100%" }}
              placeholder="选择截止日期和时间"
              disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
            />
          </Form.Item>
          <Form.Item name="module" label="所属模块">
            <Input placeholder="例如：交易管理（选填）" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}