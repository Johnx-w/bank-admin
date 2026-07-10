import { Layout, Button, Dropdown, Typography, Space, theme as antdTheme } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../../stores/authStore";
import { useAuth } from "../../hooks/useAuth";

const { Header: AntHeader } = Layout;
const { useToken } = antdTheme;

/** 路径到中文标题的映射 */
const PATH_TITLE: Record<string, string> = {
  "/": "数据概览",
  "/users": "用户管理",
  "/roles": "角色权限",
  "/transactions": "交易管理",
  "/accounts": "账户管理",
  "/settings/logs": "系统管理 - 操作日志",
  "/settings/config": "系统管理 - 系统配置",
  "/reports": "报表中心",
  "/profile": "个人中心",
};

interface HeaderProps {
  /** 移动端汉堡按钮点击回调 */
  onMobileMenuToggle?: () => void;
}

/**
 * 顶栏组件
 *
 * 包含侧边栏折叠按钮、页面标题、主题切换、全屏切换、用户下拉菜单。
 * 移动端（<768px）时显示汉堡按钮用于打开侧边抽屉。
 * 背景色通过 useToken 获取当前主题 token，亮/暗色自适应。
 */
export function Header({ onMobileMenuToggle }: HeaderProps) {
  const location = useLocation();
  const { token } = useToken();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const { user } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pageTitle = PATH_TITLE[location.pathname] || "银行后台";

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const userMenu: MenuProps = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "个人中心" },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "退出登录",
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === "logout") logout();
    },
  };

  return (
    <AntHeader
      style={{
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: token.colorBgContainer,
        borderBottom: "1px solid " + token.colorBorderSecondary,
      }}
      className="admin-header"
    >
      <Space>
        {/* 桌面端折叠按钮 */}
        <Button
          type="text"
          className="header-collapse-btn"
          icon={
            sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
          }
          onClick={toggleSidebar}
        />
        {/* 移动端汉堡按钮 */}
        {onMobileMenuToggle ? (
          <Button
            type="text"
            className="header-mobile-btn"
            icon={<MenuOutlined />}
            onClick={onMobileMenuToggle}
          />
        ) : null}
        <Typography.Text strong style={{ fontSize: 16 }}>
          {pageTitle}
        </Typography.Text>
      </Space>

      <Space>
        <Button
          type="text"
          icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
          onClick={handleThemeToggle}
          title={theme === "light" ? "切换到暗色主题" : "切换到亮色主题"}
        />
        <Button
          type="text"
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={toggleFullscreen}
        />
        <Dropdown menu={userMenu} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />}>
            {user?.nickname || "未登录"}
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
