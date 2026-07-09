import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import TransactionsPage from "./pages/Transactions";
import AccountsPage from "./pages/Accounts";
import NotFoundPage from "./pages/NotFound";
import { useAuthStore } from "./stores/authStore";

/**
 * 路由守卫 — 未登录时重定向到登录页
 */
function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/**
 * 应用路由定义
 *
 * 可扩展点：新增页面时在此文件中添加对应 Route。
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />

      {/* 需要登录的路由（AdminLayout 包裹） */}
      <Route
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<PlaceholderPage title="角色权限" />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/settings/logs" element={<PlaceholderPage title="操作日志" />} />
        <Route path="/settings/config" element={<PlaceholderPage title="系统配置" />} />
        <Route path="/reports" element={<PlaceholderPage title="报表中心" />} />
        <Route path="/profile" element={<PlaceholderPage title="个人中心" />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/** 占位页面（功能未实现时显示） */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 48, textAlign: "center", fontSize: 18 }}>
      {title} — 开发中
    </div>
  );
}