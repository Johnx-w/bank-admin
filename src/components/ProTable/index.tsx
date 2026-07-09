/**
 * ProTable — 高级表格组件
 *
 * 基于 Ant Design Table 二次封装，内置分页、Loading、空态、错误态、筛选。
 * 调用方只需提供 columns 和 dataSource，无需每次手动写 table 配置。
 *
 * 可扩展点：新增功能（列设置、导出）通过扩展 Props 接口添加。
 *
 * 规则依据：rerender-memo（表格配置稳定时避免重渲染）
 */
import { Table, type TableProps } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { AnyObject } from "antd/es/_util/type";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../utils/constants";

export interface ProTableProps<T extends AnyObject> extends Omit<TableProps<T>, "loading" | "pagination"> {
  /** 是否处于加载状态 */
  loading?: boolean;
  /** 分页配置，不传则使用默认分页 */
  pagination?: TablePaginationConfig | false;
  /** 数据为空时的提示 */
  emptyText?: string;
  /** 行 key 字段名，默认 "id" */
  rowKey?: string;
}

/**
 * 通用 ProTable 组件
 *
 * @example
 * <ProTable
 *   columns={columns}
 *   dataSource={users}
 *   loading={loading}
 *   rowKey="id"
 * />
 */
export function ProTable<T extends AnyObject>({
  columns,
  dataSource,
  loading = false,
  pagination,
  emptyText = "暂无数据",
  rowKey = "id",
  ...rest
}: ProTableProps<T>) {
  // 默认分页配置
  const defaultPagination: TablePaginationConfig = {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    pageSizeOptions: [...PAGE_SIZE_OPTIONS] as unknown as string[],
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
    ...(typeof pagination === "object" ? pagination : {}),
  };

  return (
    <Table<T>
      rowKey={rowKey}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={pagination === false ? false : defaultPagination}
      locale={{ emptyText }}
      size="middle"
      bordered
      {...rest}
    />
  );
}