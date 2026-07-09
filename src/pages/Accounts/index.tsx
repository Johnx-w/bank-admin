import { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Select, Space, Tag, Drawer, Descriptions, Spin, Typography, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { getApi } from "../../api/client";
import { ProTable } from "../../components/ProTable";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, formatMoney, maskAccount } from "../../utils/format";
import { ACCOUNT_STATUS_OPTIONS } from "../../utils/constants";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { AccountStatus, AccountType } from "../../types/account";

interface AccountListRow {
  id: string;
  accountNo: string;
  holderName: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
  openDate: string;
}

interface BalanceRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
}

interface AccountDetail {
  id: string;
  accountNo: string;
  holderName: string;
  holderId: string;
  type: string;
  currency: string;
  balance: number;
  status: string;
  openDate: string;
  freezeReason?: string;
  createdAt: string;
  updatedAt: string;
  balanceRecords: BalanceRecord[];
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "储蓄账户",
  checking: "活期账户",
  credit: "信用账户",
};

/**
 * 账户管理页面
 *
 * 展示账户列表，支持搜索和状态筛选，点击行查看详情（含余额变动记录）。
 * 规则依据：error-handling、js-early-exit、rendering-conditional-render
 */
export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pagination = usePagination();

  // 详情抽屉
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("pageSize", String(pagination.pageSize));
      if (statusFilter) params.set("status", statusFilter);
      if (keyword) params.set("keyword", keyword);

      const body = await getApi<ApiResponse<PaginatedData<AccountListRow>>>("/accounts?" + params.toString()
      );
      setAccounts(body.data.list);
      pagination.setTotal(body.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, statusFilter, keyword]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  const handleViewDetail = useCallback(async (acc: AccountListRow) => {
    setDrawerOpen(true);
    setSelectedAcc(null);
    setDetailLoading(true);
    setDetailError("");
    try {
      const detailBody = await getApi<ApiResponse<AccountDetail>>("/accounts/" + acc.id);
      setSelectedAcc(detailBody.data);
    } catch {
      setDetailError("加载详情失败，请重试");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const columns: ColumnsType<AccountListRow> = [
    {
      title: "账号",
      dataIndex: "accountNo",
      key: "accountNo",
      width: 180,
      render: (_: unknown, record: AccountListRow) => maskAccount(record.accountNo),
    },
    { title: "户名", dataIndex: "holderName", key: "holderName", width: 100 },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (_: unknown, record: AccountListRow) => ACCOUNT_TYPE_LABELS[record.type] || record.type,
    },
    { title: "币种", dataIndex: "currency", key: "currency", width: 80 },
    {
      title: "余额",
      dataIndex: "balance",
      key: "balance",
      width: 140,
      render: (_: unknown, record: AccountListRow) => formatMoney(record.balance),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: unknown, record: AccountListRow) => {
        const opt = ACCOUNT_STATUS_OPTIONS.find((o) => o.value === record.status);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      },
    },
    {
      title: "开户时间",
      dataIndex: "openDate",
      key: "openDate",
      width: 120,
      render: (_: unknown, record: AccountListRow) => formatDate(record.openDate),
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: unknown, record: AccountListRow) => (
        <PermissionBtn permCode="account:detail" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </PermissionBtn>
      ),
    },
  ];

  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>账户管理</h2>
        <Card>
          <p style={{ color: "#ff4d4f" }}>{error}</p>
          <Button onClick={fetchAccounts} style={{ marginTop: 8 }}>重试</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>账户管理</h2>

      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索账号/户名"
            allowClear
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Select
            placeholder="账户状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter || undefined}
            onChange={(val) => { pagination.setPage(1); setStatusFilter(val || ""); }}
            options={ACCOUNT_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchAccounts} loading={loading}>
            刷新
          </Button>
        </Space>
      </Card>

      {loading && accounts.length === 0 ? (
        <PageLoading />
      ) : (
        <ProTable<AccountListRow>
          columns={columns}
          dataSource={accounts}
          loading={loading}
          rowKey="id"
          emptyText="暂无账户数据"
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: pagination.onChange,
            showSizeChanger: true,
            showTotal: (total: number) => "共 " + total + " 条",
          }}
          scroll={{ x: 1000 }}
        />
      )}

      {/* 详情抽屉 */}
      <Drawer
        title="账户详情"
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedAcc(null); setDetailError(""); }}
        width={560}
      >
        {detailLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : detailError ? (
          <div>
            <Typography.Text type="danger">{detailError}</Typography.Text>
            <br />
            <Button onClick={() => handleViewDetail({ id: selectedAcc?.id || "" } as AccountListRow)} style={{ marginTop: 8 }}>重试</Button>
          </div>
        ) : selectedAcc ? (
          <>
            <Descriptions column={1} bordered size="small" labelStyle={{ width: 100 }}>
              <Descriptions.Item label="账号">{selectedAcc.accountNo}</Descriptions.Item>
              <Descriptions.Item label="户名">{selectedAcc.holderName}</Descriptions.Item>
              <Descriptions.Item label="类型">{ACCOUNT_TYPE_LABELS[selectedAcc.type] || selectedAcc.type}</Descriptions.Item>
              <Descriptions.Item label="币种">{selectedAcc.currency}</Descriptions.Item>
              <Descriptions.Item label="余额">
                <strong>{formatMoney(selectedAcc.balance)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={ACCOUNT_STATUS_OPTIONS.find((o) => o.value === selectedAcc.status)?.color}>
                  {ACCOUNT_STATUS_OPTIONS.find((o) => o.value === selectedAcc.status)?.label}
                </Tag>
              </Descriptions.Item>
              {selectedAcc.freezeReason ? (
                <Descriptions.Item label="冻结原因">{selectedAcc.freezeReason}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="开户时间">{formatDate(selectedAcc.openDate)}</Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 24 }}>
              余额变动记录
            </Typography.Title>
            {selectedAcc.balanceRecords.length > 0 ? (
              <Table<BalanceRecord>
                dataSource={selectedAcc.balanceRecords}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ marginTop: 8 }}
                columns={[
                  { title: "日期", dataIndex: "date", key: "date", width: 100, render: (_: unknown, r: BalanceRecord) => formatDate(r.date) },
                  {
                    title: "类型",
                    dataIndex: "type",
                    key: "type",
                    width: 80,
                    render: (_: unknown, r: BalanceRecord) => (
                      <Tag color={r.type === "income" ? "green" : "red"}>
                        {r.type === "income" ? "收入" : "支出"}
                      </Tag>
                    ),
                  },
                  { title: "金额", dataIndex: "amount", key: "amount", width: 120, render: (_: unknown, r: BalanceRecord) => formatMoney(r.amount) },
                  { title: "余额", dataIndex: "balanceAfter", key: "balanceAfter", width: 120, render: (_: unknown, r: BalanceRecord) => formatMoney(r.balanceAfter) },
                  { title: "描述", dataIndex: "description", key: "description" },
                ]}
              />
            ) : (
              <Typography.Text type="secondary">暂无余额变动记录</Typography.Text>
            )}
          </>
        ) : (
          <Typography.Text type="secondary">暂无数据</Typography.Text>
        )}
      </Drawer>
    </div>
  );
}