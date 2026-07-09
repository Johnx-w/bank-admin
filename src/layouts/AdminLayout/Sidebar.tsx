import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TransactionOutlined,
  CreditCardOutlined,
  SettingOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAppStore } from "../../stores/appStore";

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
 */
export function SidebarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

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
        items={MENU_ITEMS}
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