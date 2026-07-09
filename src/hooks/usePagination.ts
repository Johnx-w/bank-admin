/**
 * 分页状态管理 Hook
 *
 * 管理 page/pageSize/total，提供 onChange、reset 操作和 skip 推导值。
 * onChange 和 reset 用 useCallback 记忆化，避免下级组件不必要的重渲染。
 *
 * 规则依据：rerender-memo（记忆化回调）、rerender-derived-state-no-effect（skip 渲染时推导）
 *
 * @param defaultPageSize - 每页条数，默认 10
 */
import { useState, useCallback } from "react";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";

export function usePagination(defaultPageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  // useCallback 保持引用稳定，setPage/setPageSize 来自 useState 本身稳定
  const onChange = useCallback((p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setTotal(0);
  }, []);

  return {
    page,
    pageSize,
    total,
    /** 当前页的跳过条数，用于分页查询参数 */
    skip: (page - 1) * pageSize,
    onChange,
    reset,
    setPage,
    setPageSize,
    setTotal,
  };
}