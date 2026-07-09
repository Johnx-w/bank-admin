import { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Select, Space, Tag, Drawer, Descriptions, Spin, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { getApi } from "../../api/client";
import { ProTable } from "../../components/ProTable";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime, formatMoney } from "../../utils/format";
import { TRANSACTION_STATUS_OPTIONS, TRANSACTION_DIRECTION_OPTIONS } from "../../utils/constants";
import type { ApiResponse, PaginatedData } from "../../types/api";
import type { Transaction, TransactionStatus, TransactionDirection } from "../../types/transaction";

interface TransactionListRow {
  id: string;
  transactionNo: string;
  accountName: string;
  direction: TransactionDirection;
  amount: number;
  status: TransactionStatus;
  category: string;
  counterparty: string;
  createdAt: string;
}

/**
 * 交易管理页面
 *
 * 展示交易列表，支持按类型/状态/金额区间筛选，点击行查看详情。
 * 规则依据：
 *   error-handling（异步操作 try-catch）
 *   js-early-exit（error/loading 提前返回）
 *   rendering-conditional-render（三元表达式）
 */
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [directionFilter, setDirectionFilter] = useState<string>("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const pagination = usePagination();

  // 详情抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  /** 获取交易列表 */
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("pageSize", String(pagination.pageSize));
      if (statusFilter) params.set("status", statusFilter);
      if (directionFilter) params.set("direction", directionFilter);
      if (keyword) params.set("keyword", keyword);
      if (minAmount) params.set("minAmount", minAmount);
      if (maxAmount) params.set("maxAmount", maxAmount);

      const body = await getApi<ApiResponse<PaginatedData<Transaction>>>("/transactions?" + params.toString()
      );
      setTransactions(body.data.list);
      pagination.setTotal(body.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, statusFilter, directionFilter, keyword, minAmount, maxAmount]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /** 搜索 */
  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  /** 打开详情抽屉 */
  const handleViewDetail = useCallback(async (tx: TransactionListRow) => {
    setDrawerOpen(true);
    setSelectedTx(null);
    setDetailLoading(true);
    setDetailError("");
    try {
      const detailBody = await getApi<ApiResponse<Transaction>>("/transactions/" + tx.id);
      setSelectedTx(detailBody.data);
    } catch {
      setDetailError("加载详情失败，请重试");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /** 表格列定义 */
  const columns: ColumnsType<TransactionListRow> = [
    { title: "流水号", dataIndex: "transactionNo", key: "transactionNo", width: 180 },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (_: unknown, record: TransactionListRow) => {
        const color = record.direction === "income" ? "#52c41a" : "#ff4d4f";
        return <span style={{ color, fontWeight: 500 }}>{formatMoney(record.amount)}</span>;
      },
    },
    {
      title: "方向",
      dataIndex: "direction",
      key: "direction",
      width: 80,
      render: (_: unknown, record: TransactionListRow) => {
        const opt = TRANSACTION_DIRECTION_OPTIONS.find((o) => o.value === record.direction);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      },
    },
    { title: "类型", dataIndex: "category", key: "category", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: unknown, record: TransactionListRow) => {
        const opt = TRANSACTION_STATUS_OPTIONS.find((o) => o.value === record.status);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      },
    },
    { title: "对方账户", dataIndex: "counterparty", key: "counterparty", width: 150 },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (_: unknown, record: TransactionListRow) => formatDateTime(record.createdAt),
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: unknown, record: TransactionListRow) => (
        <PermissionBtn permCode="transaction:list" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </PermissionBtn>
      ),
    },
  ];

  /** 错误态 */
  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>交易管理</h2>
        <Card>
          <p style={{ color: "#ff4d4f" }}>{error}</p>
          <Button onClick={fetchTransactions} style={{ marginTop: 8 }}>重试</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>交易管理</h2>

      {/* 搜索筛选栏 */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索流水号/对方账户/描述"
            allowClear
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Select
            placeholder="交易状态"
            allowClear
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={(val) => { pagination.setPage(1); setStatusFilter(val || ""); }}
            options={TRANSACTION_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Select
            placeholder="交易方向"
            allowClear
            style={{ width: 120 }}
            value={directionFilter || undefined}
            onChange={(val) => { pagination.setPage(1); setDirectionFilter(val || ""); }}
            options={TRANSACTION_DIRECTION_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Input
            placeholder="最低金额(分)"
            style={{ width: 130 }}
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            placeholder="最高金额(分)"
            style={{ width: 130 }}
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchTransactions} loading={loading}>
            刷新
          </Button>
        </Space>
      </Card>

      {/* 表格 */}
      {loading && transactions.length === 0 ? (
        <PageLoading />
      ) : (
        <ProTable<TransactionListRow>
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="id"
          emptyText="暂无交易数据"
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

      {/* 详情抽屉 */}
      <Drawer
        title="交易详情"
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedTx(null); setDetailError(""); }}
        width={520}
      >
        {detailLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : detailError ? (
          <div>
            <Typography.Text type="danger">{detailError}</Typography.Text>
            <br />
            <Button onClick={() => handleViewDetail({ id: selectedTx?.id || "" } as TransactionListRow)} style={{ marginTop: 8 }}>重试</Button>
          </div>
        ) : selectedTx ? (
          <Descriptions column={1} bordered size="small" labelStyle={{ width: 100 }}>
            <Descriptions.Item label="流水号">{selectedTx.transactionNo}</Descriptions.Item>
            <Descriptions.Item label="金额">
              <span style={{ fontWeight: 600, color: selectedTx.direction === "income" ? "#52c41a" : "#ff4d4f" }}>
                {formatMoney(selectedTx.amount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="方向">
              <Tag color={TRANSACTION_DIRECTION_OPTIONS.find((o) => o.value === selectedTx.direction)?.color}>
                {TRANSACTION_DIRECTION_OPTIONS.find((o) => o.value === selectedTx.direction)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={TRANSACTION_STATUS_OPTIONS.find((o) => o.value === selectedTx.status)?.color}>
                {TRANSACTION_STATUS_OPTIONS.find((o) => o.value === selectedTx.status)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="分类">{selectedTx.category}</Descriptions.Item>
            <Descriptions.Item label="描述">{selectedTx.description}</Descriptions.Item>
            <Descriptions.Item label="对方账户">{selectedTx.counterparty}</Descriptions.Item>
            <Descriptions.Item label="操作员">{selectedTx.operatorName}</Descriptions.Item>
            {selectedTx.auditorId ? (
              <Descriptions.Item label="审核人">{selectedTx.auditorId}</Descriptions.Item>
            ) : null}
            {selectedTx.auditRemark ? (
              <Descriptions.Item label="审核备注">{selectedTx.auditRemark}</Descriptions.Item>
            ) : null}
            <Descriptions.Item label="创建时间">{formatDateTime(selectedTx.createdAt)}</Descriptions.Item>
            {selectedTx.auditedAt ? (
              <Descriptions.Item label="审核时间">{formatDateTime(selectedTx.auditedAt)}</Descriptions.Item>
            ) : null}
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">暂无数据</Typography.Text>
        )}
      </Drawer>
    </div>
  );
}