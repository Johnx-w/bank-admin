import { Modal, type ModalFuncProps } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface ConfirmModalOptions {
  title: string;
  content: string;
  /** 确认按钮文本 */
  okText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认类型，默认 warning */
  type?: "info" | "warning" | "error";
  onOk: () => Promise<void> | void;
  onCancel?: () => void;
}

/**
 * 二次确认弹窗（银行操作专用）
 *
 * 封装 Ant Design Modal.confirm，统一银行场景下的关键操作确认样式。
 * 适用于删除、审核、冻结等需要用户二次确认的场景。
 *
 * @example
 * confirmAction({
 *   title: "确认删除该用户？",
 *   content: "删除后无法恢复，请谨慎操作。",
 *   onOk: async () => await deleteUser(id),
 * });
 *
 * 规则依据：js-early-exit（无 title 时提前返回）
 */
export function confirmAction(options: ConfirmModalOptions): void {
  const { title, content, okText = "确认", cancelText = "取消", type = "warning", onOk, onCancel } = options;

  if (!title || !content) return;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    okType: type === "error" ? "danger" : "primary",
    onOk,
    onCancel,
  } as ModalFuncProps);
}