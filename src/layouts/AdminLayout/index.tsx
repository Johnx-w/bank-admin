import { useState, useCallback } from "react";
import { Layout, Drawer, Grid } from "antd";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarMenu } from "./Sidebar";
import { Header } from "./Header";
import { TabsView } from "./TabsView";
import { ErrorBoundary } from "../../components/ErrorBoundary";

const { Content } = Layout;
const { useBreakpoint } = Grid;

/**
 * 管理后台主布局
 *
 * 桌面端（>= 768px）：固定侧边栏（Sider）+ 顶栏 + 标签页 + 内容区
 * 移动端（< 768px）：侧边栏替换为 Drawer（由 Header 汉堡按钮控制开关）
 *
 * 使用 ErrorBoundary 包裹内容区，防止单个页面崩溃导致整个布局白屏。
 */
export function AdminLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const screens = useBreakpoint();

  const isMobile = screens.xs && !screens.md;

  /** 移动端切换抽屉 */
  const handleMobileMenuToggle = useCallback(() => {
    setMobileDrawerOpen((prev) => !prev);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 桌面端侧边栏 */}
      {!isMobile ? <Sidebar /> : null}

      {/* 移动端侧边抽屉 */}
      {isMobile ? (
        <Drawer
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          width={220}
          styles={{ body: { padding: 0 } }}
          className="layout-mobile-drawer"
        >
          <Layout>
            <SidebarMenu />
          </Layout>
        </Drawer>
      ) : null}

      <Layout>
        <Header
          onMobileMenuToggle={isMobile ? handleMobileMenuToggle : undefined}
        />
        <TabsView />
        <Content className="layout-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
}