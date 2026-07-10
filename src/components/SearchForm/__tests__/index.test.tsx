// @vitest-environment jsdom
/**
 * SearchForm 组件单元测试
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { SearchForm } from "../index";

describe("SearchForm", () => {
  it("应正确渲染 keyword 搜索框", () => {
    const { container } = render(
      <SearchForm
        items={[
          {
            type: "keyword",
            placeholder: "搜索用户名",
            onSearch: () => {},
            width: 200,
          },
        ]}
      />
    );

    const input = container.querySelector("input");
    expect(input).toBeTruthy();
    expect(input?.getAttribute("placeholder")).toBe("搜索用户名");
  });

  it("应渲染 extra 区域", () => {
    const { getByText } = render(
      <SearchForm items={[]} extra={<span>自定义按钮</span>} />
    );

    expect(getByText("自定义按钮")).toBeTruthy();
  });

  it("空 items 且无 extra 时不应崩溃", () => {
    const { container } = render(<SearchForm items={[]} />);
    expect(container.querySelector(".ant-card")).toBeTruthy();
  });
});
