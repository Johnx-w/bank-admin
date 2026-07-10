import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import TransactionsPage from "./pages/Transactions";
import AccountsPage from "./pages/Accounts";
import RolesPage from "./pages/Roles";
import LogsPage from "./pages/Settings/LogsPage";
import ConfigPage from "./pages/Settings/ConfigPage";
import ProfilePage from "./pages/Profile";
import ReportsPage from "./pages/Reports";
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
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/settings/logs" element={<LogsPage />} />
        <Route path="/settings/config" element={<ConfigPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
