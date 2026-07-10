/**
 * 报表中心页面
 *
 * 使用 ECharts 展示交易趋势折线图和交易分类饼图。
 * 轻量自封装 ChartContainer 替代 echarts-for-react，
 * 通过 useRef + useEffect 直接操作 ECharts 实例。
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, Row, Col, Typography, Button, Spin, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import * as echarts from "echarts/core";
import { LineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import { fetchDashboard } from "../../api/dashboard";
import type { TrendDataPoint, CategoryStat, DashboardStats } from "../../types/dashboard";
import { formatMoney } from "../../utils/format";

echarts.use([
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

/** 轻量图表容器，监听 resize 自适应 */
function ChartContainer({
  option,
  style,
}: {
  option: EChartsOption;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = echarts.init(containerRef.current);
    chartRef.current.setOption(option);
    const onResize = () => chartRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chartRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} style={style} />;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lineOption: EChartsOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: trend.map((t) => t.date) },
    yAxis: { type: "value" },
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

  const pieOption: EChartsOption = {
    tooltip: { trigger: "item" },
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

  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>报表中心</h2>
        <div style={{ padding: 48, textAlign: "center" }}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={loadData} style={{ marginTop: 12 }}>重试</Button>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>报表中心</h2>
        <div style={{ display: "flex", justifyContent: "center", padding: 120 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

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

      {stats ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">总用户数</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {stats.totalUsers}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">今日交易笔数</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {stats.todayTransactions}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">今日交易金额</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {formatMoney(stats.todayAmount)}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Typography.Text type="secondary">待审核</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#faad14" }}>
                {stats.pendingAudit}
              </div>
            </Card>
          </Col>
        </Row>
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="交易趋势（近7天）">
            {trend.length > 0 ? (
              <ChartContainer option={lineOption} style={{ height: 320 }} />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="交易分类分布">
            {categories.length > 0 ? (
              <ChartContainer option={pieOption} style={{ height: 320 }} />
            ) : (
              <Empty description="暂无分类数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
