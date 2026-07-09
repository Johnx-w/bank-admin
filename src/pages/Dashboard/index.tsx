import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Button, List, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getApi } from "../../api/client";
import { StatCard } from "../../components/StatCard";
import { PageLoading } from "../../components/PageLoading";
import type { ApiResponse } from "../../types/api";
import type { DashboardData, TodoItem } from "../../types/dashboard";
import { PRIORITY_OPTIONS } from "../../utils/constants";

/**
 * 仪表盘页面
 *
 * 展示统计数据卡片、交易趋势图、分类饼图和待办事项。
 * 数据来自 /api/dashboard（MSW 拦截）。
 *
 * 规则依据：
 *   rerender-derived-state-no-effect（图表数据在渲染时推导）
 *   error-handling（异步操作 try-catch + 友好提示）
 *   js-early-exit（未加载完时显示 loading）
 */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getApi<ApiResponse<DashboardData>>("/dashboard");
      setData(response.data);
    } catch {
      setError("数据加载失败，请检查后端服务是否正常运行");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <Card>
        <Typography.Text type="danger">{error}</Typography.Text>
        <br />
        <Button onClick={fetchData} style={{ marginTop: 8 }}>
          重试
        </Button>
      </Card>
    );
  }

  if (loading || !data) {
    return <PageLoading />;
  }

  /** 待办事项优先级对应的标签颜色 */
  const priorityColor = (p: TodoItem["priority"]) =>
    PRIORITY_OPTIONS.find((o) => o.value === p)?.color || "default";

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
          <StatCard title="待审核" value={data.stats.pendingAudit} color="#faad14" icon="📋" onClick={() => navigate("/transactions")} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="异常告警" value={data.stats.anomalyCount} color="#ff4d4f" icon="🚨" onClick={() => navigate("/transactions")} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 待办事项 */}
        <Col xs={24} lg={8}>
          <Card title="📌 待办事项" styles={{ body: { padding: 12 } }}>
            <List
              dataSource={data.todos}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/" + item.module === "交易管理" ? "transactions" : "")}
                >
                  <List.Item.Meta
                    title={
                      <span>
                        <Tag color={priorityColor(item.priority)}>
                          {PRIORITY_OPTIONS.find((o) => o.value === item.priority)?.label}
                        </Tag>
                        {item.title}
                      </span>
                    }
                    description={`截止：${item.deadline}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}