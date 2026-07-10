/**
 * 用户管理页面
 *
 * 展示用户列表，支持搜索、筛选、新增、编辑、删除、启用/禁用，以及详情查看。
 *
 * 规则依据：
 *   rerender-memo（回调记忆化）
 *   error-handling（异步操作 try-catch + 友好提示）
 *   js-early-exit（error/loading 提前返回）
 *   rendering-conditional-render（三元表达式条件渲染）
 *   rerender-derived-state-no-effect（分页参数在渲染时推导）
 */
import { useState, useEffect, useCallback } from "react";
import { Drawer, Descriptions, Tag, Space, Typography, Button, Spin } from "antd";
import { PlusOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { Input, Form, Select } from "antd";
import { ProTable } from "../../components/ProTable";
import { SearchForm } from "../../components/SearchForm";
import { ProForm } from "../../components/ProForm";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { confirmAction } from "../../components/ConfirmModal";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, maskPhone } from "../../utils/format";
import { validatePhone, validateEmail, validatePassword } from "../../utils/validate";
import { USER_STATUS_OPTIONS } from "../../utils/constants";
import type { ColumnsType } from "antd/es/table";
import type { User, UserFormData, UserStatus } from "../../types/user";
import { fetchUserList, fetchUserById, createUser, updateUser, deleteUser, updateUserStatus } from "../../api/users";

interface UserListRow {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: UserStatus;
  department: string;
  roleIds: string[];
  createdAt: string;
}

/**
 * 用户管理页面
 */
export default function UsersPage() {
  const [users, setUsers] = useState<UserListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pagination = usePagination();
  const [form] = Form.useForm<UserFormData>();

  // 详情抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  /** 获取用户列表 */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchUserList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
      });
      setUsers(res.data.list);
      pagination.setTotal(res.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, statusFilter, keyword]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /** 搜索 */
  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  /** 打开新增模态框 */
  const handleAdd = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: "active" as const, roleIds: [] });
    setModalVisible(true);
  }, [form]);

  /** 打开编辑模态框 */
  const handleEdit = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.setFieldsValue({
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleIds: user.roleIds,
        department: user.department,
      });
      setModalVisible(true);
    },
    [form]
  );

  /** 提交表单 */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingUser) {
        await updateUser(editingUser.id, values);
      } else {
        const payload = { ...values, password: values.password || "12345678" };
        await createUser(payload);
      }
      setModalVisible(false);
      loadUsers();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      if (apiErr?.response?.data?.message) {
        // 错误信息由 ProForm 统一处理
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, editingUser, loadUsers]);

  /** 删除用户 */
  const handleDelete = useCallback(
    (user: User) => {
      confirmAction({
        title: "确认删除该用户？",
        content: "删除后无法恢复，请谨慎操作。",
        type: "error",
        onOk: async () => {
          await deleteUser(user.id);
          loadUsers();
        },
      });
    },
    [loadUsers]
  );

  /** 切换用户启用/禁用状态 */
  const handleToggleStatus = useCallback(
    (user: User) => {
      const newStatus: UserStatus = user.status === "active" ? "disabled" : "active";
      const actionLabel = newStatus === "disabled" ? "禁用" : "启用";
      confirmAction({
        title: "确认" + actionLabel + "该用户？",
        content: actionLabel + "后该用户将" + (newStatus === "disabled" ? "无法登录系统" : "恢复系统访问权限") + "。",
        type: "warning",
        onOk: async () => {
          await updateUserStatus(user.id, newStatus);
          loadUsers();
        },
      });
    },
    [loadUsers]
  );

  /** 查看用户详情 */
  const handleViewDetail = useCallback(async (user: UserListRow) => {
    setDrawerOpen(true);
    setDetailUser(null);
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await fetchUserById(user.id);
      setDetailUser(res.data);
    } catch {
      setDetailError("加载详情失败，请重试");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /** 表格列定义 */
  const columns: ColumnsType<UserListRow> = [
    { title: "用户名", dataIndex: "username", key: "username", width: 100 },
    { title: "昵称", dataIndex: "nickname", key: "nickname", width: 100 },
    { title: "邮箱", dataIndex: "email", key: "email", width: 180 },
    {
      title: "手机",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (_: unknown, record: UserListRow) => maskPhone(record.phone),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (_: unknown, record: UserListRow) => {
        const opt = USER_STATUS_OPTIONS.find((o) => o.value === record.status);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      },
    },
    { title: "部门", dataIndex: "department", key: "department", width: 100 },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (_: unknown, record: UserListRow) => formatDate(record.createdAt),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_: unknown, record: UserListRow) => (
        <Space size="small">
          <PermissionBtn permCode="user:edit" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </PermissionBtn>
          <PermissionBtn permCode="user:edit" type="link" size="small" onClick={() => handleEdit(record as User)}>
            编辑
          </PermissionBtn>
          <PermissionBtn permCode="user:delete" type="link" size="small" danger onClick={() => handleDelete(record as User)}>
            删除
          </PermissionBtn>
          <PermissionBtn permCode="user:status" type="link" size="small" onClick={() => handleToggleStatus(record as User)}>
            {record.status === "active" ? "禁用" : "启用"}
          </PermissionBtn>
        </Space>
      ),
    },
  ];

  /** 错误态 */
  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>用户管理</h2>
        <div style={{ padding: 48, textAlign: "center" }}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={loadUsers} style={{ marginTop: 12 }}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>用户管理</h2>

      {/* 搜索筛选栏 — 使用 SearchForm */}
      <SearchForm
        items={[
          {
            type: "keyword",
            placeholder: "搜索用户名/昵称/邮箱",
            width: 260,
            onSearch: handleSearch,
          },
          {
            type: "select",
            placeholder: "用户状态",
            width: 140,
            value: statusFilter,
            onChange: (val: string) => {
              pagination.setPage(1);
              setStatusFilter(val);
            },
            options: USER_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          },
        ]}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadUsers} loading={loading}>
              刷新
            </Button>
            <PermissionBtn permCode="user:create" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增用户
            </PermissionBtn>
          </Space>
        }
      />

      {/* 表格 */}
      {loading && users.length === 0 ? (
        <PageLoading />
      ) : (
        <ProTable<UserListRow>
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          emptyText="暂无用户数据"
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: pagination.onChange,
            showSizeChanger: true,
            showTotal: (total: number) => "共 " + total + " 条",
          }}
          scroll={{ x: 1200 }}
        />
      )}

      {/* 新建/编辑 — 使用 ProForm */}
      <ProForm<User | null>
        open={modalVisible}
        editingItem={editingUser}
        titleLabel="用户"
        form={form}
        submitting={submitting}
        onFinish={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
          <Input placeholder="请输入用户名" maxLength={50} />
        </Form.Item>
        <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: "请输入昵称" }]}>
          <Input placeholder="请输入昵称" maxLength={50} />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱" }, { validator: validateEmail }]}>
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item name="phone" label="手机号" rules={[{ required: true, message: "请输入手机号" }, { validator: validatePhone }]}>
          <Input placeholder="请输入手机号" maxLength={11} />
        </Form.Item>
        <Form.Item name="department" label="部门" rules={[{ required: true, message: "请输入部门" }]}>
          <Input placeholder="请输入部门" maxLength={50} />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
          <Select options={USER_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
        </Form.Item>
        {!editingUser ? (
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }, { validator: validatePassword }]}>
            <Input.Password placeholder="请输入密码（8-20位，含字母和数字）" maxLength={20} />
          </Form.Item>
        ) : null}
      </ProForm>

      {/* 详情 Drawer */}
      <Drawer
        title="用户详情"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDetailUser(null);
          setDetailError("");
        }}
        width={480}
      >
        {detailLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : detailError ? (
          <div>
            <Typography.Text type="danger">{detailError}</Typography.Text>
            <br />
            <Button
              onClick={() => handleViewDetail({ id: detailUser?.id || "" } as UserListRow)}
              style={{ marginTop: 8 }}
            >
              重试
            </Button>
          </div>
        ) : detailUser ? (
          <Descriptions column={1} bordered size="small" labelStyle={{ width: 90 }}>
            <Descriptions.Item label="用户名">{detailUser.username}</Descriptions.Item>
            <Descriptions.Item label="昵称">{detailUser.nickname}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detailUser.email}</Descriptions.Item>
            <Descriptions.Item label="手机">{maskPhone(detailUser.phone)}</Descriptions.Item>
            <Descriptions.Item label="部门">{detailUser.department}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={USER_STATUS_OPTIONS.find((o) => o.value === detailUser.status)?.color}>
                {USER_STATUS_OPTIONS.find((o) => o.value === detailUser.status)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{formatDate(detailUser.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{formatDate(detailUser.updatedAt)}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">暂无数据</Typography.Text>
        )}
      </Drawer>
    </div>
  );
}
