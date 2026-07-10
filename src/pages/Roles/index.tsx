/**
 * 角色权限页面
 *
 * 展示角色列表，支持搜索、新增/编辑角色（含权限树选择）和删除操作。
 *
 * 规则依据：
 *   error-handling、js-early-exit、rendering-conditional-render、rerender-memo
 */
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Space,
  Tag,
  Form,
  Input,
  Select,
  Tree,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { ProTable } from "../../components/ProTable";
import { SearchForm } from "../../components/SearchForm";
import { ProForm } from "../../components/ProForm";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { confirmAction } from "../../components/ConfirmModal";
import { usePagination } from "../../hooks/usePagination";
import { formatDate } from "../../utils/format";
import type { Role, RoleFormData, PermissionNode } from "../../types/role";
import { fetchRoleList, fetchRoleById, createRole, updateRole, deleteRole } from "../../api/roles";
import { postApi, getApi } from "../../api/client";
import type { ApiResponse } from "../../types/api";

/** 将 MOCK_PERMISSIONS 记录列表转为 Tree 节点 */
function buildPermissionTree(
  permissions: { id: string; name: string; code: string; type: string; parentId: string | null; sort: number; label: string }[]
): PermissionNode[] {
  const nodes: PermissionNode[] = [];
  const parentMap = new Map<string | null, PermissionNode[]>();
  parentMap.set(null, nodes);

  for (const p of permissions) {
    const node: PermissionNode = {
      key: p.code,
      title: p.label || p.name,
      children: [],
    };
    if (!parentMap.has(p.code)) {
      parentMap.set(p.code, []);
    }
    node.children = parentMap.get(p.code) || [];
    parentMap.set(p.code, node.children);

    const siblings = parentMap.get(p.parentId) || [];
    siblings.push(node);
    parentMap.set(p.parentId, siblings);
  }

  return nodes;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const pagination = usePagination();

  // 新建/编辑模态框
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<RoleFormData>();

  // 权限树数据
  const [permTree, setPermTree] = useState<PermissionNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  /** 加载权限树 */
  const loadPermissions = useCallback(async () => {
    try {
      const res = await getApi<ApiResponse<{ id: string; name: string; code: string; type: string; parentId: string | null; sort: number; label: string }[]>>("/permissions");
      const tree = buildPermissionTree(res.data);
      setPermTree(tree);
    } catch {
      // 权限树加载失败不影响主流程
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchRoleList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: keyword || undefined,
      });
      setRoles(res.data.list);
      pagination.setTotal(res.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, keyword]);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ status: "active" as const, permissionIds: [] });
    setCheckedKeys([]);
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    async (role: Role) => {
      setEditingRole(role);
      form.setFieldsValue({
        name: role.name,
        code: role.code,
        description: role.description,
        status: role.status,
        permissionIds: role.permissionIds,
      });
      setCheckedKeys(role.permissionIds);
      setModalVisible(true);
    },
    [form]
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        ...values,
        permissionIds: checkedKeys,
      };
      if (editingRole) {
        await updateRole(editingRole.id, payload);
      } else {
        await createRole(payload);
      }
      setModalVisible(false);
      loadRoles();
    } catch {
      // 错误由 ProForm 统一处理
    } finally {
      setSubmitting(false);
    }
  }, [form, checkedKeys, editingRole, loadRoles]);

  const handleDelete = useCallback(
    (role: Role) => {
      confirmAction({
        title: "确认删除该角色？",
        content: "删除后该角色下的用户将失去对应权限，请谨慎操作。",
        type: "error",
        onOk: async () => {
          await deleteRole(role.id);
          loadRoles();
        },
      });
    },
    [loadRoles]
  );

  const columns: ColumnsType<Role> = [
    { title: "角色名称", dataIndex: "name", key: "name", width: 120 },
    { title: "角色编码", dataIndex: "code", key: "code", width: 100 },
    { title: "描述", dataIndex: "description", key: "description", width: 200, ellipsis: true },
    {
      title: "用户数",
      dataIndex: "userCount",
      key: "userCount",
      width: 80,
      render: (_: unknown, record: Role) => record.userCount,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (_: unknown, record: Role) => (
        <Tag color={record.status === "active" ? "green" : "red"}>
          {record.status === "active" ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (_: unknown, record: Role) => formatDate(record.createdAt),
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: unknown, record: Role) => (
        <Space size="small">
          <PermissionBtn permCode="user:edit" type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </PermissionBtn>
          <PermissionBtn permCode="user:delete" type="link" size="small" danger onClick={() => handleDelete(record)}>
            删除
          </PermissionBtn>
        </Space>
      ),
    },
  ];

  /** 权限树节点选中处理 */
  const handleTreeCheck = useCallback((checked: string[] | { checked: string[]; halfChecked: string[] }) => {
    if (Array.isArray(checked)) {
      setCheckedKeys(checked);
    } else {
      setCheckedKeys(checked.checked);
    }
  }, []);

  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>角色权限</h2>
        <div style={{ padding: 48, textAlign: "center" }}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={loadRoles} style={{ marginTop: 12 }}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>角色权限</h2>

      <SearchForm
        items={[
          {
            type: "keyword",
            placeholder: "搜索角色名称/编码",
            width: 240,
            onSearch: handleSearch,
          },
        ]}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadRoles} loading={loading}>
              刷新
            </Button>
            <PermissionBtn permCode="user:create" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增角色
            </PermissionBtn>
          </Space>
        }
      />

      {loading && roles.length === 0 ? (
        <PageLoading />
      ) : (
        <ProTable<Role>
          columns={columns}
          dataSource={roles}
          loading={loading}
          rowKey="id"
          emptyText="暂无角色数据"
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: pagination.onChange,
            showSizeChanger: true,
            showTotal: (total: number) => "共 " + total + " 条",
          }}
          scroll={{ x: 900 }}
        />
      )}

      {/* 新建/编辑 */}
      <ProForm<Role | null>
        open={modalVisible}
        editingItem={editingRole}
        titleLabel="角色"
        form={form}
        submitting={submitting}
        onFinish={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form.Item name="name" label="角色名称" rules={[{ required: true, message: "请输入角色名称" }]}>
          <Input placeholder="请输入角色名称" maxLength={50} />
        </Form.Item>
        <Form.Item name="code" label="角色编码" rules={[{ required: true, message: "请输入角色编码" }]}>
          <Input placeholder="请输入角色编码（如 admin）" maxLength={30} disabled={!!editingRole} />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入角色描述" rows={2} maxLength={200} />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
          <Select
            options={[
              { label: "启用", value: "active" },
              { label: "禁用", value: "disabled" },
            ]}
          />
        </Form.Item>
        <Form.Item label="权限配置">
          <div style={{ border: "1px solid #d9d9d9", borderRadius: 6, padding: 8, maxHeight: 300, overflowY: "auto" }}>
            <Tree
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={handleTreeCheck}
              treeData={permTree}
            />
          </div>
        </Form.Item>
      </ProForm>
    </div>
  );
}
