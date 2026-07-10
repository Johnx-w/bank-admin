/**
 * 账户管理页面
 *
 * 展示账户列表，支持搜索/筛选、详情查看、开户多步表单和冻结/解冻操作。
 *
 * 规则依据：
 *   error-handling、js-early-exit、rendering-conditional-render、rerender-memo
 */
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Spin,
  Typography,
  Modal,
  Steps,
  Form,
  Input,
  Select,
  InputNumber,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { ProTable } from "../../components/ProTable";
import { SearchForm } from "../../components/SearchForm";
import { PageLoading } from "../../components/PageLoading";
import { PermissionBtn } from "../../components/PermissionBtn";
import { confirmAction } from "../../components/ConfirmModal";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, formatMoney, maskAccount } from "../../utils/format";
import { ACCOUNT_STATUS_OPTIONS } from "../../utils/constants";
import type { AccountStatus, AccountType, AccountFormData } from "../../types/account";
import { fetchAccountList, fetchAccountById, createAccount, toggleAccountStatus } from "../../api/accounts";
import type { BalanceRecord, AccountDetail } from "../../api/accounts";

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

const ACCOUNT_TYPE_OPTIONS = [
  { label: "储蓄账户", value: "savings" },
  { label: "活期账户", value: "checking" },
  { label: "信用账户", value: "credit" },
];

const CURRENCY_OPTIONS = [
  { label: "人民币 (CNY)", value: "CNY" },
  { label: "美元 (USD)", value: "USD" },
  { label: "欧元 (EUR)", value: "EUR" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const pagination = usePagination();

  // 详情抽屉
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // 开户多步表单
  const [openAccountOpen, setOpenAccountOpen] = useState(false);
  const [openAccountStep, setOpenAccountStep] = useState(0);
  const [openAccountSubmitting, setOpenAccountSubmitting] = useState(false);
  const [openAccountForm] = Form.useForm();

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAccountList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
      });
      setAccounts(res.data.list as AccountListRow[]);
      pagination.setTotal(res.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, statusFilter, keyword]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

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
      const res = await fetchAccountById(acc.id);
      setSelectedAcc(res.data);
    } catch {
      setDetailError("加载详情失败，请重试");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /** 冻结/解冻 */
  const handleToggleFreeze = useCallback(
    (acc: AccountListRow) => {
      const isFrozen = acc.status === "frozen";
      confirmAction({
        title: isFrozen ? "确认解冻账户？" : "确认冻结账户？",
        content: isFrozen
          ? "解冻后该账户将恢复正常使用。"
          : "冻结后该账户将无法进行任何交易操作。",
        type: "warning",
        onOk: async () => {
          await toggleAccountStatus(acc.id, isFrozen ? "active" : "frozen");
          loadAccounts();
        },
      });
    },
    [loadAccounts]
  );

  /** 开户提交 */
  const handleOpenAccount = useCallback(async () => {
    try {
      const values = await openAccountForm.validateFields();
      setOpenAccountSubmitting(true);
      // 将分步表单的值合并
      const payload: AccountFormData = {
        holderName: values.holderName,
        holderId: values.holderId,
        type: values.type,
        currency: values.currency,
        initialDeposit: values.initialDeposit || 0,
      };
      await createAccount(payload);
      setOpenAccountOpen(false);
      setOpenAccountStep(0);
      openAccountForm.resetFields();
      loadAccounts();
    } catch {
      // 校验失败时停留当前步骤
    } finally {
      setOpenAccountSubmitting(false);
    }
  }, [openAccountForm, loadAccounts]);

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
      render: (_: unknown, record: AccountListRow) => {
        const opt = ACCOUNT_TYPE_OPTIONS.find((o) => o.value === record.type);
        return opt?.label || record.type;
      },
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
      width: 80,
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
      width: 200,
      fixed: "right",
      render: (_: unknown, record: AccountListRow) => (
        <Space size="small">
          <PermissionBtn permCode="account:list" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </PermissionBtn>
          <PermissionBtn
            permCode="account:detail"
            type="link"
            size="small"
            icon={record.status === "frozen" ? <UnlockOutlined /> : <LockOutlined />}
            onClick={() => handleToggleFreeze(record)}
          >
            {record.status === "frozen" ? "解冻" : "冻结"}
          </PermissionBtn>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 16 }}>账户管理</h2>
        <div style={{ padding: 48, textAlign: "center" }}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <br />
          <Button onClick={loadAccounts} style={{ marginTop: 12 }}>重试</Button>
        </div>
      </div>
    );
  }

  /** 开户步骤定义 */
  const openAccountSteps = [
    { title: "基本信息" },
    { title: "账户设置" },
    { title: "确认提交" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>账户管理</h2>

      <SearchForm
        items={[
          {
            type: "keyword",
            placeholder: "搜索账号/户名",
            width: 240,
            onSearch: handleSearch,
          },
          {
            type: "select",
            placeholder: "账户状态",
            width: 140,
            value: statusFilter,
            onChange: (val: string) => {
              pagination.setPage(1);
              setStatusFilter(val);
            },
            options: ACCOUNT_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          },
        ]}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadAccounts} loading={loading}>
              刷新
            </Button>
            <PermissionBtn
              permCode="account:list"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenAccountOpen(true)}
            >
              开户
            </PermissionBtn>
          </Space>
        }
      />

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
          scroll={{ x: 1100 }}
        />
      )}

      {/* 详情抽屉 */}
      <Drawer
        title="账户详情"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedAcc(null);
          setDetailError("");
        }}
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
            <Button
              onClick={() =>
                handleViewDetail({ id: selectedAcc?.id || "" } as AccountListRow)
              }
              style={{ marginTop: 8 }}
            >
              重试
            </Button>
          </div>
        ) : selectedAcc ? (
          <>
            <Descriptions column={1} bordered size="small" labelStyle={{ width: 100 }}>
              <Descriptions.Item label="账号">{selectedAcc.accountNo}</Descriptions.Item>
              <Descriptions.Item label="户名">{selectedAcc.holderName}</Descriptions.Item>
              <Descriptions.Item label="类型">
                {ACCOUNT_TYPE_OPTIONS.find((o) => o.value === selectedAcc.type)?.label || selectedAcc.type}
              </Descriptions.Item>
              <Descriptions.Item label="币种">{selectedAcc.currency}</Descriptions.Item>
              <Descriptions.Item label="余额">
                <strong>{formatMoney(selectedAcc.balance)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={
                    ACCOUNT_STATUS_OPTIONS.find((o) => o.value === selectedAcc.status)?.color
                  }
                >
                  {
                    ACCOUNT_STATUS_OPTIONS.find((o) => o.value === selectedAcc.status)?.label
                  }
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
            {selectedAcc.balanceRecords && selectedAcc.balanceRecords.length > 0 ? (
              <Table<BalanceRecord>
                dataSource={selectedAcc.balanceRecords}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ marginTop: 8 }}
                columns={[
                  {
                    title: "日期",
                    dataIndex: "date",
                    key: "date",
                    width: 100,
                    render: (_: unknown, r: BalanceRecord) => formatDate(r.date),
                  },
                  {
                    title: "类型",
                    dataIndex: "type",
                    key: "type",
                    width: 70,
                    render: (_: unknown, r: BalanceRecord) => (
                      <Tag color={r.type === "income" ? "green" : "red"}>
                        {r.type === "income" ? "收入" : "支出"}
                      </Tag>
                    ),
                  },
                  {
                    title: "金额",
                    dataIndex: "amount",
                    key: "amount",
                    width: 120,
                    render: (_: unknown, r: BalanceRecord) => formatMoney(r.amount),
                  },
                  {
                    title: "余额",
                    dataIndex: "balanceAfter",
                    key: "balanceAfter",
                    width: 120,
                    render: (_: unknown, r: BalanceRecord) => formatMoney(r.balanceAfter),
                  },
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

      {/* 开户多步表单 */}
      <Modal
        title="开户"
        open={openAccountOpen}
        onCancel={() => {
          setOpenAccountOpen(false);
          setOpenAccountStep(0);
          openAccountForm.resetFields();
        }}
        width={560}
        footer={
          <Space>
            <Button onClick={() => {
              setOpenAccountOpen(false);
              setOpenAccountStep(0);
              openAccountForm.resetFields();
            }}>
              取消
            </Button>
            {openAccountStep > 0 ? (
              <Button onClick={() => setOpenAccountStep((s) => s - 1)}>
                上一步
              </Button>
            ) : null}
            {openAccountStep < 2 ? (
              <Button
                type="primary"
                onClick={async () => {
                  // 校验当前步骤的必要字段
                  try {
                    if (openAccountStep === 0) {
                      await openAccountForm.validateFields(["holderName", "holderId"]);
                    } else if (openAccountStep === 1) {
                      await openAccountForm.validateFields(["type", "currency", "initialDeposit"]);
                    }
                    setOpenAccountStep((s) => s + 1);
                  } catch {
                    // 校验失败停留
                  }
                }}
              >
                下一步
              </Button>
            ) : (
              <Button
                type="primary"
                loading={openAccountSubmitting}
                onClick={handleOpenAccount}
              >
                确认开户
              </Button>
            )}
          </Space>
        }
      >
        <Steps
          current={openAccountStep}
          items={openAccountSteps}
          style={{ marginBottom: 24 }}
          size="small"
        />

        <Form form={openAccountForm} layout="vertical">
          {/* 步骤 0: 基本信息 */}
          {openAccountStep === 0 ? (
            <>
              <Form.Item
                name="holderName"
                label="持有人姓名"
                rules={[{ required: true, message: "请输入持有人姓名" }]}
              >
                <Input placeholder="请输入姓名" maxLength={50} />
              </Form.Item>
              <Form.Item
                name="holderId"
                label="证件号码"
                rules={[{ required: true, message: "请输入证件号码" }]}
              >
                <Input placeholder="请输入身份证号" maxLength={18} />
              </Form.Item>
            </>
          ) : null}

          {/* 步骤 1: 账户设置 */}
          {openAccountStep === 1 ? (
            <>
              <Form.Item
                name="type"
                label="账户类型"
                rules={[{ required: true, message: "请选择账户类型" }]}
              >
                <Select options={ACCOUNT_TYPE_OPTIONS} placeholder="请选择账户类型" />
              </Form.Item>
              <Form.Item
                name="currency"
                label="币种"
                rules={[{ required: true, message: "请选择币种" }]}
              >
                <Select options={CURRENCY_OPTIONS} placeholder="请选择币种" />
              </Form.Item>
              <Form.Item
                name="initialDeposit"
                label="初始存入金额（分）"
                rules={[{ required: true, message: "请输入初始存入金额" }]}
              >
                <InputNumber
                  placeholder="请输入金额（单位：分，1元=100）"
                  min={0}
                  max={99999999999}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </>
          ) : null}

          {/* 步骤 2: 确认 */}
          {openAccountStep === 2 ? (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="持有人姓名">
                {openAccountForm.getFieldValue("holderName")}
              </Descriptions.Item>
              <Descriptions.Item label="证件号码">
                {openAccountForm.getFieldValue("holderId")}
              </Descriptions.Item>
              <Descriptions.Item label="账户类型">
                {ACCOUNT_TYPE_OPTIONS.find(
                  (o) => o.value === openAccountForm.getFieldValue("type")
                )?.label}
              </Descriptions.Item>
              <Descriptions.Item label="币种">
                {openAccountForm.getFieldValue("currency")}
              </Descriptions.Item>
              <Descriptions.Item label="初始存入">
                {formatMoney(openAccountForm.getFieldValue("initialDeposit") || 0)}
              </Descriptions.Item>
            </Descriptions>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
