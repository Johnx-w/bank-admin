/**
 * 操作日志页面
 */
import { useState, useEffect, useCallback } from "react";
import { Button, Space, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { ProTable } from "../../components/ProTable";
import { SearchForm } from "../../components/SearchForm";
import { PageLoading } from "../../components/PageLoading";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime } from "../../utils/format";
import type { OperationLog } from "../../types/system";
import { fetchLogList } from "../../api/system";

const LOG_TYPE_OPTIONS = [
  { label: "用户操作", value: "user" },
  { label: "交易操作", value: "transaction" },
  { label: "系统操作", value: "system" },
  { label: "账户操作", value: "account" },
  { label: "角色操作", value: "role" },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const pagination = usePagination();

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchLogList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: typeFilter || undefined,
        keyword: keyword || undefined,
      });
      setLogs(res.data.list);
      pagination.setTotal(res.data.total);
    } catch {
      setError("数据加载失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, typeFilter, keyword]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = useCallback((value: string) => {
    pagination.setPage(1);
    setKeyword(value);
  }, []);

  const columns: ColumnsType<OperationLog> = [
    { title: "操作人", dataIndex: "operatorName", key: "operatorName", width: 100 },
    {
      title: "操作类型",
      dataIndex: "action",
      key: "action",
      width: 150,
    },
    { title: "目标类型", dataIndex: "targetType", key: "targetType", width: 100 },
    { title: "详情", dataIndex: "detail", key: "detail", width: 300, ellipsis: true },
    { title: "IP 地址", dataIndex: "ipAddress", key: "ipAddress", width: 140 },
    {
      title: "操作时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (_: unknown, record: OperationLog) => formatDateTime(record.createdAt),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Typography.Text type="danger">{error}</Typography.Text>
        <br />
        <Button onClick={loadLogs} style={{ marginTop: 12 }}>重试</Button>
      </div>
    );
  }

  return (
    <div>
      <SearchForm
        items={[
          {
            type: "keyword",
            placeholder: "搜索操作人/详情",
            width: 240,
            onSearch: handleSearch,
          },
          {
            type: "select",
            placeholder: "操作类型",
            width: 130,
            value: typeFilter,
            onChange: (val: string) => {
              pagination.setPage(1);
              setTypeFilter(val);
            },
            options: LOG_TYPE_OPTIONS,
          },
        ]}
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadLogs} loading={loading}>
            刷新
          </Button>
        }
      />

      {loading && logs.length === 0 ? (
        <PageLoading />
      ) : (
        <ProTable<OperationLog>
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          emptyText="暂无操作日志"
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
    </div>
  );
}
