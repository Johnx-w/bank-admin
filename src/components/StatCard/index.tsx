import { Card, Typography, Spin } from "antd";

interface StatCardProps {
  title: string;
  value: string | number;
  /** 图标背景色 */
  color?: string;
  /** 图标文字或表情 */
  icon?: string;
  /** 是否处于加载状态 */
  loading?: boolean;
  /** 点击卡片回调 */
  onClick?: () => void;
}

/**
 * 统计卡片组件
 *
 * 用于 Dashboard 等概览页面展示关键指标，带图标和颜色标识。
 * 规则依据：js-early-exit（loading 时返回骨架屏）
 */
export function StatCard({ title, value, color = "#1677ff", icon, loading, onClick }: StatCardProps) {
  if (loading) {
    return (
      <Card style={{ borderRadius: 8 }}>
        <Spin />
      </Card>
    );
  }

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ borderRadius: 8 }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {icon && (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Typography.Text>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}