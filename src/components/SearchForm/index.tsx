/**
 * SearchForm — 搜索/筛选栏组件
 *
 * 配合 ProTable 使用，封装关键词搜索、下拉筛选等常见筛选模式。
 * 通过 items 配置数组声明式定义筛选项，内置 300ms 防抖搜索。
 *
 * 规则依据：rerender-memo（onChange 回调记忆化）
 *
 * @example
 * <SearchForm
 *   items={[
 *     { type: "keyword", placeholder: "搜索用户名", onSearch: handleSearch },
 *     { type: "select", placeholder: "状态", value: status, onChange: setStatus, options: [...], allowClear: true, width: 120 },
 *   ]}
 *   extra={<Button onClick={refresh}>刷新</Button>}
 * />
 */
import {
  Input,
  Select,
  Space,
  Card,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useCallback, useRef, useEffect, type ReactNode } from "react";

/** 筛选项类型 */
type SearchItemType = "keyword" | "select";

/** 筛选项配置 */
interface SearchItemBase {
  /** 筛选项类型 */
  type: SearchItemType;
  /** 宽度（默认 200） */
  width?: number;
}

interface KeywordItem extends SearchItemBase {
  type: "keyword";
  /** 搜索框 placeholder */
  placeholder?: string;
  /** 搜索回调（自动防抖 300ms） */
  onSearch: (value: string) => void;
  /** 是否支持清除 */
  allowClear?: boolean;
}

interface SelectItem extends SearchItemBase {
  type: "select";
  /** 下拉框 placeholder */
  placeholder?: string;
  /** 当前选中值 */
  value?: string;
  /** 值变更回调 */
  onChange: (value: string) => void;
  /** 下拉选项 */
  options: { label: string; value: string }[];
  /** 是否支持清除 */
  allowClear?: boolean;
}

type SearchItem = KeywordItem | SelectItem;

interface SearchFormProps {
  /** 筛选项配置数组 */
  items: SearchItem[];
  /** 额外操作区域（如刷新按钮） */
  extra?: ReactNode;
}

/**
 * 通用搜索筛选栏
 */
export function SearchForm({ items, extra }: SearchFormProps) {
  return (
    <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
      <Space wrap size="middle">
        {items.map((item, index) => {
          const key = "search-item-" + index;
          const width = item.width || 200;
          if (item.type === "keyword") {
            return <SearchInput key={key} item={item} width={width} />;
          }
          if (item.type === "select") {
            return <SelectFilter key={key} item={item} width={width} />;
          }
          return null;
        })}
        {extra}
      </Space>
    </Card>
  );
}

/** 带防抖的关键词搜索框 */
function SearchInput({
  item,
  width,
}: {
  item: KeywordItem;
  width: number;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef("");

  /** 清理定时器 */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      valueRef.current = val;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        item.onSearch(valueRef.current);
      }, 300);
    },
    [item.onSearch]
  );

  return (
    <Input
      placeholder={item.placeholder || "请输入关键词"}
      allowClear={item.allowClear !== false}
      style={{ width }}
      prefix={<SearchOutlined />}
      onChange={handleChange}
    />
  );
}

/** 下拉筛选器 */
function SelectFilter({
  item,
  width,
}: {
  item: SelectItem;
  width: number;
}) {
  return (
    <Select
      placeholder={item.placeholder || "请选择"}
      allowClear={item.allowClear !== false}
      style={{ width }}
      value={item.value || undefined}
      onChange={item.onChange}
      options={item.options}
    />
  );
}
