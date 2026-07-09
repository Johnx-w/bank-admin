// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "../usePagination";

describe("usePagination", () => {
  it("初始状态应为 page=1, pageSize=10, total=0", () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.total).toBe(0);
    expect(result.current.skip).toBe(0);
  });

  it("onChange 应同时更新 page 和 pageSize", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.onChange(3, 20));
    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(20);
  });

  it("skip 应为 (page - 1) * pageSize 的计算结果", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.onChange(3, 20));
    expect(result.current.skip).toBe(40);
  });

  it("reset 应回到初始状态", () => {
    const { result } = renderHook(() => usePagination());
    act(() => { result.current.onChange(5, 50); result.current.setTotal(200); });
    act(() => result.current.reset());
    expect(result.current.page).toBe(1);
    expect(result.current.total).toBe(0);
  });

  it("reset 不应修改 pageSize", () => {
    const { result } = renderHook(() => usePagination());
    act(() => { result.current.onChange(3, 50); });
    act(() => result.current.reset());
    expect(result.current.pageSize).toBe(50);
  });

  it("应支持自定义默认 pageSize", () => {
    const { result } = renderHook(() => usePagination(20));
    expect(result.current.pageSize).toBe(20);
  });

  it("setPage 应只更新当前页", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);
    expect(result.current.pageSize).toBe(10);
  });

  it("setTotal 应只更新总数", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(150));
    expect(result.current.total).toBe(150);
    expect(result.current.page).toBe(1);
  });
});