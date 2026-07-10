import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface TabItem {
  key: string;
  label: string;
  closable: boolean;
}

const TAB_TITLE: Record<string, string> = {
  "/": "数据概览",
  "/users": "用户管理",
  "/roles": "角色权限",
  "/transactions": "交易管理",
  "/accounts": "账户管理",
  "/settings/logs": "操作日志",
  "/settings/config": "系统配置",
  "/reports": "报表中心",
  "/profile": "个人中心",
};

/**
 * 多标签导航组件
 *
 * 在页面头部显示已访问页面的标签，支持点击切换和关闭。
 * 新标签页的添加在 useEffect 中触发，避免直接 setState 导致的重复渲染。
 *
 * 可扩展点：持久化标签页状态到 localStorage。
 */
export function TabsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: "/", label: TAB_TITLE["/"], closable: false },
  ]);

  const currentPath = location.pathname;
  const exists = tabs.some((t) => t.key === currentPath);

  // 使用 useEffect 添加新标签页，避免在渲染过程中 setState 导致死循环
  useEffect(() => {
    if (currentPath !== "/" && !exists) {
      setTabs((prev) => [
        ...prev,
        { key: currentPath, label: TAB_TITLE[currentPath] || currentPath, closable: true },
      ]);
    }
  }, [currentPath, exists]);

  const onTabChange = (key: string) => {
    navigate(key);
  };

  const onTabRemove = (targetKey: string) => {
    const newTabs = tabs.filter((t) => t.key !== targetKey);
    setTabs(newTabs);

    if (currentPath === targetKey && newTabs.length > 0) {
      navigate(newTabs[newTabs.length - 1].key);
    }
  };

  if (tabs.length <= 1 && currentPath === "/") return null;

  return (
    <Tabs
      activeKey={currentPath}
      type="editable-card"
      hideAdd
      size="small"
      items={tabs.map((t) => ({
        key: t.key,
        label: t.label,
        closable: t.closable,
      }))}
      onChange={onTabChange}
      onEdit={(targetKey) => onTabRemove(targetKey as string)}
      style={{ margin: "0 16px" }}
    />
  );
}