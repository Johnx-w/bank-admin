import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { PageLoading } from "./components/PageLoading";
import { useAuthStore } from "./stores/authStore";

/**
 * 路由懒加载 — 按页面拆分 chunk，减少首屏 JS 体积。
 * 首屏只需 Login，其他页面（含 echarts / xlsx 等重依赖）按需加载。
 * GitHub Pages CDN 慢的环境下效果显著：首屏从 1.9MB 降至 ~500KB。
 */
const LoginPage = lazy(() => import("./pages/Login"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const UsersPage = lazy(() => import("./pages/Users"));
const TransactionsPage = lazy(() => import("./pages/Transactions"));
const AccountsPage = lazy(() => import("./pages/Accounts"));
const RolesPage = lazy(() => import("./pages/Roles"));
const LogsPage = lazy(() => import("./pages/Settings/LogsPage"));
const ConfigPage = lazy(() => import("./pages/Settings/ConfigPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const ReportsPage = lazy(() => import("./pages/Reports"));
const CompletedTodosPage = lazy(() => import("./pages/CompletedTodos"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

/** 懒加载路由的 Suspense 包裹 */
function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>;
}

/**
 * 路由守卫 — 未登录时重定向到登录页
 */
function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  if (!isInitialized) {
    return <PageLoading tip="正在恢复登录状态..." />;
  }
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
          <LazyPage>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </LazyPage>
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
        <Route path="/" element={<LazyPage><DashboardPage /></LazyPage>} />
        <Route path="/users" element={<LazyPage><UsersPage /></LazyPage>} />
        <Route path="/roles" element={<LazyPage><RolesPage /></LazyPage>} />
        <Route path="/transactions" element={<LazyPage><TransactionsPage /></LazyPage>} />
        <Route path="/accounts" element={<LazyPage><AccountsPage /></LazyPage>} />
        <Route path="/settings/logs" element={<LazyPage><LogsPage /></LazyPage>} />
        <Route path="/settings/config" element={<LazyPage><ConfigPage /></LazyPage>} />
        <Route path="/reports" element={<LazyPage><ReportsPage /></LazyPage>} />
        <Route path="/completed-todos" element={<LazyPage><CompletedTodosPage /></LazyPage>} />
        <Route path="/profile" element={<LazyPage><ProfilePage /></LazyPage>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<LazyPage><NotFoundPage /></LazyPage>} />
    </Routes>
  );
}
