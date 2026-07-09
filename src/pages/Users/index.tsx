import { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Select, Space, Tag, Modal, Form, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { getApi, putApi, postApi, deleteApi, patchApi } from "../../api/client";
import { ProTable } from "../../components/ProTable";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { confirmAction } from "../../components/ConfirmModal";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, maskPhone } from "../../utils/format";
import { validatePhone, validateEmail, validatePassword } from "../../utils/validate";
import { USER_STATUS_OPTIONS } from "../../utils/constants";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { User, UserFormData, UserStatus } from "../../types/user";

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
 *
 * 展示用户列表，支持搜索、筛选、新增、编辑、删除、启用/禁用。
 * 规则依据：
 *   rerender-derived-state-no-effect（当前页过滤条件在渲染时推导）
 *   error-handling（异步操作 try-catch + 友好提示）
 *   js-early-exit（error/loading 提前返回）
 *   rendering-conditional-render（三元表达式条件渲染）
 */
export default function UsersPage() {
  const [users, setUsers] = useState<UserListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pagination = usePagination();
  const [form] = Form.useForm<UserFormData>();

  /** 获取用户列表 */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("pageSize", String(pagination.pageSize));
      if (statusFilter) params.set("status", statusFilter);
      if (keyword) params.set("keyword", keyword);

      const body = await getApi<ApiResponse<PaginatedData<User>>>("/users?" + params.toString()
      );
      setUsers(body.data.list);
      pagination.setTotal(body.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, statusFilter, keyword]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** 搜索 */
  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  /** 打开新增模态框 */
  const handleAdd = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", roleIds: [] });
    setModalVisible(true);
  }, [form]);

  /** 打开编辑模态框 */
  const handleEdit = useCallback((user: User) => {
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
  }, [form]);

  /** 提交表单 */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingUser) {
        await putApi("/users/" + editingUser.id, values);
        message.success("用户信息已更新");
      } else {
        const payload = { ...values, password: values.password || "12345678" };
        await postApi("/users", payload);
        message.success("用户创建成功");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: ApiResponse } };
      if (apiErr?.response?.data?.message) {
        message.error(apiErr.response.data.message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, editingUser, fetchUsers]);

  /** 删除用户 */
  const handleDelete = useCallback((user: User) => {
    confirmAction({
      title: "确认删除该用户？",
      content: "删除后无法恢复，请谨慎操作。",
      type: "error",
      onOk: async () => {
        await deleteApi("/users/" + user.id);
        message.success("用户已删除");
        fetchUsers();
      },
    });
  }, [fetchUsers]);

  /** 启用/禁用用户 */
  const handleToggleStatus = useCallback((user: User) => {
    const newStatus: UserStatus = user.status === "active" ? "disabled" : "active";
    const actionLabel = newStatus === "active" ? "启用" : "禁用";
    confirmAction({
      title: "确认" + actionLabel + "该用户？",
      content: "将用户状态变更为" + (newStatus === "active" ? "正常" : "禁用") + "，是否继续？",
      onOk: async () => {
        await patchApi("/users/" + user.id + "/status", { status: newStatus });
        message.success("用户状态已更新");
        fetchUsers();
      },
    });
  }, [fetchUsers]);

  /** 表格列定义 */
  const columns: ColumnsType<UserListRow> = [
    { title: "用户名", dataIndex: "username", key: "username", width: 120 },
    { title: "昵称", dataIndex: "nickname", key: "nickname", width: 120 },
    { title: "邮箱", dataIndex: "email", key: "email", width: 180 },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (_: unknown, record: UserListRow) => maskPhone(record.phone),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
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
      width: 280,
      fixed: "right",
      render: (_: unknown, record: UserListRow) => (
        <Space size="small">
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
        <Card>
          <p style={{ color: "#ff4d4f" }}>{error}</p>
          <Button onClick={fetchUsers} style={{ marginTop: 8 }}>重试</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>用户管理</h2>

      {/* 搜索筛选栏 */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索用户名/昵称/邮箱"
            allowClear
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Select
            placeholder="用户状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter || undefined}
            onChange={(val) => {
              pagination.setPage(1);
              setStatusFilter(val || "");
            }}
            options={USER_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            刷新
          </Button>
          <PermissionBtn permCode="user:create" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </PermissionBtn>
        </Space>
      </Card>

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
          scroll={{ x: 1100 }}
        />
      )}

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingUser ? "编辑用户" : "新增用户"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        width={560}
        destroyOnClose
      >
        <Form<UserFormData>
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
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
        </Form>
      </Modal>
    </div>
  );
}