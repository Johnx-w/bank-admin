import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Typography, Badge } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TransactionOutlined,
  CreditCardOutlined,
  SettingOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAppStore } from "../../stores/appStore";
import { useTodoStore } from "../../stores/todoStore";

const { Sider } = Layout;

/** 菜单配置项 */
const MENU_ITEMS: MenuProps["items"] = [
  { key: "/", icon: <DashboardOutlined />, label: "数据概览" },
  { key: "/users", icon: <UserOutlined />, label: "用户管理" },
  { key: "/roles", icon: <SafetyCertificateOutlined />, label: "角色权限" },
  { key: "/transactions", icon: <TransactionOutlined />, label: "交易管理" },
  { key: "/accounts", icon: <CreditCardOutlined />, label: "账户管理" },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: "系统管理",
    children: [
      { key: "/settings/logs", label: "操作日志" },
      { key: "/settings/config", label: "系统配置" },
    ],
  },
  { key: "/reports", icon: <BarChartOutlined />, label: "报表中心" },
];

/**
 * 侧边栏菜单内容（纯菜单，不含 Sider 外壳）
 *
 * 提取为独立组件，供桌面端 Sider 和移动端 Drawer 复用。
 * 菜单项包含静态路由 + 动态"已完成待办"（带 Badge 计数）。
 */
export function SidebarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const completedCount = useTodoStore((s) => {
    // 仅统计上次查看后新完成的待办（Badge 已读机制）
    if (!s.lastViewedCompletedAt) {
      return s.customTodos.filter((t) => t.completed).length;
    }
    return s.customTodos.filter(
      (t) => t.completed && t.completedAt && t.completedAt > s.lastViewedCompletedAt!,
    ).length;
  });

  /** 动态构建菜单项（静态项 + 已完成待办） */
  const menuItems: MenuProps["items"] = [
    ...(MENU_ITEMS ?? []),
    {
      key: "/completed-todos",
      icon: <CheckCircleOutlined />,
      label: sidebarCollapsed ? (
        <Badge count={completedCount} size="small" offset={[4, 0]}>
          <span style={{ color: "rgba(255,255,255,0.65)" }}>完成</span>
        </Badge>
      ) : (
        <span>
          已完成待办
          {completedCount > 0 && (
            <Badge
              count={completedCount}
              size="small"
              style={{ marginLeft: 8 }}
              styles={{ root: { boxShadow: "none" } }}
            />
          )}
        </span>
      ),
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  return (
    <>
      <div className="layout-logo">
        <Typography.Text
          strong
          className="layout-logo-text"
          style={{ fontSize: sidebarCollapsed ? 14 : 16 }}
        >
          {sidebarCollapsed ? "💰" : "💰 银行后台"}
        </Typography.Text>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["/settings"]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  );
}

/**
 * 侧边导航栏（桌面端）
 *
 * 使用 Ant Design Sider，支持折叠。
 * 折叠状态从 appStore 读取。
 */
export function Sidebar() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      trigger={null}
      theme="dark"
      width={220}
      className="layout-sider"
    >
      <SidebarMenu />
    </Sider>
  );
}