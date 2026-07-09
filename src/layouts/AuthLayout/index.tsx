import type { ReactNode } from "react";
import { Card } from "antd";

interface AuthLayoutProps {
  children: ReactNode;
  /** 页面标题，如 "登录" */
  title?: string;
}

/**
 * 认证页布局
 *
 * 居中卡片布局，适用于登录页、注册页等无需侧边栏的页面。
 * 规则依据：rendering-conditional-render（无标题时只展示子组件）
 */
export function AuthLayout({ children, title = "银行后台管理系统" }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 8,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
        </div>
        {children}
      </Card>
    </div>
  );
}