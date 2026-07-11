/**
 * 交易管理页面
 *
 * 展示交易列表，支持多条件筛选、详情查看和审核操作（通过/驳回 + 二次确认）。
 *
 * 规则依据：
 *   error-handling（异步操作 try-catch）
 *   js-early-exit（error/loading 提前返回）
 *   rendering-conditional-render（三元表达式）
 *   rerender-memo（回调记忆化）
 */
import { useState, useEffect, useCallback } from "react";
import { Button, Space, Tag, Drawer, Descriptions, Spin, Typography, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { ProTable } from "../../components/ProTable";
import { SearchForm } from "../../components/SearchForm";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { confirmAction } from "../../components/ConfirmModal";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime, formatMoney } from "../../utils/format";
import {
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_DIRECTION_OPTIONS,
} from "../../utils/constants";
import type { Transaction, TransactionStatus, TransactionDirection } from "../../types/transaction";
import { fetchTransactionList, fetchTransactionById, auditTransactions } from "../../api/transactions";

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const pagination = usePagination();

  // 详情抽屉
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  /** 获取交易列表 */
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchTransactionList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: statusFilter || undefined,
        direction: directionFilter || undefined,
        keyword: keyword || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
      });
      setTransactions(res.data.list);
      pagination.setTotal(res.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.pageSize,
    statusFilter,
    directionFilter,
    keyword,
    minAmount,
    maxAmount,
  ]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  /** 查看详情 */
  const handleViewDetail = useCallback(async (tx: TransactionListRow) => {
    setDrawerOpen(true);
    setSelectedTx(null);
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await fetchTransactionById(tx.id);
      setSelectedTx(res.data);
    } catch {
      setDetailError("加载详情失败，请重试");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /** 审核通过 */
  const handleApprove = useCallback(
    (tx: TransactionListRow) => {
      confirmAction({
        title: "确认审核通过？",
        content: "审核通过后交易即刻生效，" + tx.transactionNo + " 将标记为已通过。",
        type: "warning",
        okText: "确认通过",
        onOk: async () => {
          await auditTransactions({
            transactionIds: [tx.id],
            action: "approve",
            remark: "",
          });
          loadTransactions();
          setDrawerOpen(false);
        },
      });
    },
    [loadTransactions]
  );

  /** 审核驳回 */
  const handleReject = useCallback(
    (tx: TransactionListRow) => {
      confirmAction({
        title: "确认驳回该交易？",
        content: "驳回后 " + tx.transactionNo + " 将被标记为已驳回状态，不可恢复。",
        type: "error",
        okText: "确认驳回",
        onOk: async () => {
          await auditTransactions({
            transactionIds: [tx.id],
            action: "reject",
            remark: "审核驳回",
          });
          loadTransactions();
          setDrawerOpen(false);
        },
      });
    },
    [loadTransactions]
  );

  /** 表格列定义 */
  const columns: ColumnsType<TransactionListRow> = [
    {
      title: "流水号",
      dataIndex: "transactionNo",
      key: "transactionNo",
      width: 190,
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (_: unknown, record: TransactionListRow) => {
        const color = record.direction === "income" ? "#52c41a" : "#ff4d4f";
        return (
          <span style={{ color, fontWeight: 500 }}>
            {formatMoney(record.amount)}
          </span>
        );
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
      width: 90,
      render: (_: unknown, record: TransactionListRow) => {
        const opt = TRANSACTION_STATUS_OPTIONS.find((o) => o.value === record.status);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      },
    },
    { title: "对方账户", dataIndex: "counterparty", key: "counterparty", width: 150, ellipsis: true },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (_: unknown, record: TransactionListRow) => formatDateTime(record.createdAt),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_: unknown, record: TransactionListRow) => (
        <Space size="small">
          <PermissionBtn permCode="transaction:list" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </PermissionBtn>
          {record.status === "pending" ? (
            <>
              <PermissionBtn permCode="transaction:approve" type="link" size="small" icon={<CheckOutlined />} style={{ color: "#52c41a" }} onClick={() => handleApprove(record)}>
                通过
              </PermissionBtn>
              <PermissionBtn permCode="transaction:approve" type="link" size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(record)}>
                驳回
              </PermissionBtn>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  /** 错误态 */
  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>交易管理</h2>
        <div style={{ padding: 48, textAlign: "center" }}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={loadTransactions} style={{ marginTop: 12 }}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>交易管理</h2>

      {/* 搜索筛选栏 */}
      <SearchForm
        items={[
          {
            type: "keyword",
            placeholder: "搜索流水号/对方账户",
            width: 220,
            onSearch: handleSearch,
          },
          {
            type: "select",
            placeholder: "交易状态",
            width: 120,
            value: statusFilter,
            onChange: (val: string) => {
              pagination.setPage(1);
              setStatusFilter(val);
            },
            options: TRANSACTION_STATUS_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            })),
          },
          {
            type: "select",
            placeholder: "交易方向",
            width: 110,
            value: directionFilter,
            onChange: (val: string) => {
              pagination.setPage(1);
              setDirectionFilter(val);
            },
            options: TRANSACTION_DIRECTION_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            })),
          },
        ]}
        extra={
          <Space>
            <Input
              placeholder="最低金额"
              style={{ width: 110 }}
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
            <Input
              placeholder="最高金额"
              style={{ width: 110 }}
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={loadTransactions} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      />

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
          scroll={{ x: 1200 }}
          onRow={(record: TransactionListRow) => ({
            style: { cursor: "pointer" },
            onClick: () => handleViewDetail(record),
          })}
        />
      )}

      {/* 详情抽屉 */}
      <Drawer
        title="交易详情"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTx(null);
          setDetailError("");
        }}
        width={520}
        extra={
          selectedTx && selectedTx.status === "pending" ? (
            <Space>
              <PermissionBtn
                permCode="transaction:approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(selectedTx as unknown as TransactionListRow)}
              >
                审核通过
              </PermissionBtn>
              <PermissionBtn
                permCode="transaction:approve"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(selectedTx as unknown as TransactionListRow)}
              >
                驳回
              </PermissionBtn>
            </Space>
          ) : undefined
        }
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
              onClick={() =>
                handleViewDetail({ id: selectedTx?.id || "" } as TransactionListRow)
              }
              style={{ marginTop: 8 }}
            >
              重试
            </Button>
          </div>
        ) : selectedTx ? (
          <Descriptions column={1} bordered size="small" labelStyle={{ width: 100 }}>
            <Descriptions.Item label="流水号">{selectedTx.transactionNo}</Descriptions.Item>
            <Descriptions.Item label="金额">
              <span
                style={{
                  fontWeight: 600,
                  color: selectedTx.direction === "income" ? "#52c41a" : "#ff4d4f",
                }}
              >
                {formatMoney(selectedTx.amount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="方向">
              <Tag
                color={
                  TRANSACTION_DIRECTION_OPTIONS.find((o) => o.value === selectedTx.direction)
                    ?.color
                }
              >
                {
                  TRANSACTION_DIRECTION_OPTIONS.find((o) => o.value === selectedTx.direction)
                    ?.label
                }
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                color={
                  TRANSACTION_STATUS_OPTIONS.find((o) => o.value === selectedTx.status)
                    ?.color
                }
              >
                {
                  TRANSACTION_STATUS_OPTIONS.find((o) => o.value === selectedTx.status)
                    ?.label
                }
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
            <Descriptions.Item label="创建时间">
              {formatDateTime(selectedTx.createdAt)}
            </Descriptions.Item>
            {selectedTx.auditedAt ? (
              <Descriptions.Item label="审核时间">
                {formatDateTime(selectedTx.auditedAt)}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">暂无数据</Typography.Text>
        )}
      </Drawer>
    </div>
  );
}
