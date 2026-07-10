// @vitest-environment jsdom
/**
 * ProForm 组件单元测试
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Form, Input } from "antd";

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

import { ProForm } from "../index";

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function Wrapper({
  open = true,
  editingItem = null,
  submitting = false,
}: {
  open?: boolean;
  editingItem?: { id: string } | null;
  submitting?: boolean;
}) {
  const [form] = Form.useForm();

  return (
    <ProForm
      open={open}
      editingItem={editingItem}
      titleLabel="用户"
      form={form}
      submitting={submitting}
      onFinish={async () => {}}
      onCancel={() => {}}
    >
      <Form.Item name="username" label="用户名">
        <Input />
      </Form.Item>
    </ProForm>
  );
}

describe("ProForm", () => {
  it("新增模式下标题应为 '新增用户'", () => {
    const { getByText } = render(<Wrapper />);
    expect(getByText("新增用户")).toBeTruthy();
  });

  it("编辑模式下标题应为 '编辑用户'", () => {
    const { getByText } = render(<Wrapper editingItem={{ id: "u001" }} />);
    expect(getByText("编辑用户")).toBeTruthy();
  });

  it("应渲染表单中的 input（Modal 通过 Portal 挂载到 body）", () => {
    const { baseElement } = render(<Wrapper />);
    const inputs = baseElement.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("不打开时不应显示模态框", () => {
    const { baseElement } = render(<Wrapper open={false} />);
    const modalTitle = baseElement.querySelector(".ant-modal-title");
    expect(modalTitle).toBeFalsy();
  });
});
