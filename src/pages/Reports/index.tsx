/**
 * 报表中心页面
 *
 * 使用 ECharts 展示交易趋势折线图和交易分类饼图。
 * 数据来自 /api/dashboard。
 */
import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Button, Space, Spin, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { fetchDashboard } from "../../api/dashboard";
import type { DashboardStats, TrendDataPoint, CategoryStat, TodoItem } from "../../types/dashboard";
import { formatMoney } from "../../utils/format";

// 按需注册 ECharts 组件
echarts.use([
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchDashboard();
      setStats(res.data.stats);
      setTrend(res.data.transactionTrend);
      setCategories(res.data.categoryDistribution);
    } catch {
      setError("数据加载失败，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>报表中心</h2>
        <div style={{ padding: 48, textAlign: "center" }}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={loadData} style={{ marginTop: 12 }}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>报表中心</h2>
        <div style={{ display: "flex", justifyContent: "center", padding: 120 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  /** 折线图配置 */
  const lineOption = {
    tooltip: { trigger: "axis" as const },
    xAxis: {
      type: "category" as const,
      data: trend.map((t) => t.date),
    },
    yAxis: { type: "value" as const },
    series: [
      {
        name: "交易量",
        type: "line",
        data: trend.map((t) => t.value),
        smooth: true,
        areaStyle: { opacity: 0.1 },
        color: "#1677ff",
      },
    ],
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
  };

  /** 饼图配置 */
  const pieOption = {
    tooltip: { trigger: "item" as const },
    legend: { bottom: 0 },
    series: [
      {
        name: "交易分类",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
        data: categories.map((c) => ({ name: c.name, value: c.value })),
      },
    ],
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>报表中心</h2>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadData}>
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {stats ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">总用户数</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalUsers}</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">今日交易笔数</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.todayTransactions}</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">今日交易金额</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{formatMoney(stats.todayAmount)}</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">待审核</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#faad14" }}>{stats.pendingAudit}</div>
            </Card>
          </Col>
        </Row>
      ) : null}

      {/* 图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="交易趋势（近7天）">
            {trend.length > 0 ? (
              <ReactEChartsCore
                echarts={echarts}
                option={lineOption}
                style={{ height: 320 }}
                notMerge
              />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="交易分类分布">
            {categories.length > 0 ? (
              <ReactEChartsCore
                echarts={echarts}
                option={pieOption}
                style={{ height: 320 }}
                notMerge
              />
            ) : (
              <Empty description="暂无分类数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
