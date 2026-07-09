import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { postApi } from "../../api/client";
import { useAuthStore } from "../../stores/authStore";
import { usePermissionStore } from "../../stores/permissionStore";
import { getPermissionsByRoleIds } from "../../utils/permission";
import type { ApiResponse } from "../../types/api";
import type { User } from "../../types/user";

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponseData {
  user: User;
  token: string;
}

/**
 * 登录页面
 *
 * 表单提交后调用登录 API（MSW 拦截返回 Mock 数据），
 * 成功后保存用户信息和 Token 到 authStore，根据角色设置权限，跳转首页。
 *
 * 规则依据：error-handling（异步操作 try-catch + 友好提示）
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const response = await postApi<ApiResponse<LoginResponseData>>("/login", values);
      const { user, token } = response.data;
      setUser(user, token);
      // 根据用户角色设置权限
      const permissions = getPermissionsByRoleIds(user.roleIds);
      usePermissionStore.getState().setPermissions(permissions);
      message.success("登录成功");
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiResponse } };
      message.error(err?.response?.data?.message || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form<LoginFormData>
      onFinish={handleSubmit}
      size="large"
      autoComplete="off"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: "请输入用户名" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "请输入密码" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登 录
        </Button>
      </Form.Item>
    </Form>
  );
}