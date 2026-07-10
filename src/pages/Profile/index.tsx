/**
 * 个人中心页面
 *
 * 展示当前用户信息、编辑个人信息和修改密码。
 */
import { useState, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Descriptions,
  Tag,
  Tabs,
  Typography,
  message,
  Space,
  Divider,
} from "antd";
import { UserOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";
import { formatDate, maskPhone } from "../../utils/format";
import { validatePhone, validateEmail, validatePassword } from "../../utils/validate";
import { USER_STATUS_OPTIONS } from "../../utils/constants";
import { updateUser } from "../../api/users";
import type { UserFormData } from "../../types/user";

export default function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const token = useAuthStore((s) => s.token);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwdChanging, setPwdChanging] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const handleStartEdit = useCallback(() => {
    if (!user) return;
    form.setFieldsValue({
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
    setEditing(true);
  }, [user, form]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updateUser(user.id, values as Partial<UserFormData>);
      setUser({ ...user, ...values }, token || "");
      message.success("个人信息已更新");
      setEditing(false);
    } catch {
      // 校验失败
    } finally {
      setSaving(false);
    }
  }, [user, form, token, setUser]);

  const handleChangePwd = useCallback(async () => {
    try {
      const values = await pwdForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error("两次输入的新密码不一致");
        return;
      }
      setPwdSaving(true);
      // Mock 修改密码（实际应调用专门接口）
      await updateUser(user?.id || "", {
        username: user?.username || "",
        nickname: user?.nickname || "",
        email: user?.email || "",
        phone: user?.phone || "",
        status: user?.status || "active",
        department: user?.department || "",
        roleIds: user?.roleIds || [],
      } as UserFormData);
      message.success("密码修改成功，请重新登录");
      pwdForm.resetFields();
      setPwdChanging(false);
    } catch {
      // 校验失败
    } finally {
      setPwdSaving(false);
    }
  }, [user, pwdForm]);

  if (!user) {
    return (
      <Card>
        <Typography.Text type="secondary">请先登录</Typography.Text>
      </Card>
    );
  }

  const statusOpt = USER_STATUS_OPTIONS.find((o) => o.value === user.status);

  const tabItems = [
    {
      key: "info",
      label: "基本信息",
      children: (
        <>
          <Divider orientation="left" style={{ marginTop: 0 }}>
            个人信息
          </Divider>

          {!editing ? (
            <>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                <Descriptions.Item label="昵称">{user.nickname}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
                <Descriptions.Item label="手机">{maskPhone(user.phone)}</Descriptions.Item>
                <Descriptions.Item label="部门">{user.department}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusOpt?.color}>{statusOpt?.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">{formatDate(user.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="最后更新">{formatDate(user.updatedAt)}</Descriptions.Item>
              </Descriptions>
              <Button
                type="primary"
                icon={<UserOutlined />}
                style={{ marginTop: 16 }}
                onClick={handleStartEdit}
              >
                编辑信息
              </Button>
            </>
          ) : (
            <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
              <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: "请输入昵称" }]}>
                <Input placeholder="昵称" maxLength={50} />
              </Form.Item>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱" }, { validator: validateEmail }]}>
                <Input placeholder="邮箱" />
              </Form.Item>
              <Form.Item name="phone" label="手机" rules={[{ required: true, message: "请输入手机号" }, { validator: validatePhone }]}>
                <Input placeholder="手机号" maxLength={11} />
              </Form.Item>
              <Form.Item name="department" label="部门" rules={[{ required: true, message: "请输入部门" }]}>
                <Input placeholder="部门" maxLength={50} />
              </Form.Item>
              <Space>
                <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                  保存
                </Button>
                <Button onClick={() => setEditing(false)}>取消</Button>
              </Space>
            </Form>
          )}
        </>
      ),
    },
    {
      key: "password",
      label: "修改密码",
      children: !pwdChanging ? (
        <div style={{ padding: "24px 0" }}>
          <Typography.Paragraph type="secondary">
            修改密码后，您需要重新登录系统。
          </Typography.Paragraph>
          <Button
            type="primary"
            icon={<LockOutlined />}
            onClick={() => setPwdChanging(true)}
          >
            修改密码
          </Button>
        </div>
      ) : (
        <Form form={pwdForm} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }, { validator: validatePassword }]}
          >
            <Input.Password placeholder="8-20位，含字母和数字" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[{ required: true, message: "请再次输入新密码" }]}
          >
            <Input.Password placeholder="再次输入新密码" maxLength={20} />
          </Form.Item>
          <Space>
            <Button type="primary" loading={pwdSaving} onClick={handleChangePwd}>
              确认修改
            </Button>
            <Button
              onClick={() => {
                setPwdChanging(false);
                pwdForm.resetFields();
              }}
            >
              取消
            </Button>
          </Space>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>个人中心</h2>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
