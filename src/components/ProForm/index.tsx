/**
 * ProForm — 模态框表单组件
 *
 * 基于 Ant Design Modal + Form 二次封装，统一处理：
 * - 新建/编辑双模式（title 自动切换）
 * - loading 态（确认按钮 loading）
 * - 校验失败自动提示
 * - 提交错误友好提示
 * - destroyOnHidden 确保每次打开表单都是干净状态
 *
 * 规则依据：
 *   rerender-memo（handleOk 记忆化）
 *   error-handling（异步提交 try-catch）
 *   rendering-conditional-render（三元切换标题）
 *
 * @example
 * <ProForm
 *   open={modalVisible}
 *   editingItem={editingUser}
 *   titleLabel="用户"
 *   form={form}
 *   submitting={submitting}
 *   onFinish={handleSubmit}
 *   onCancel={() => setModalVisible(false)}
 * >
 *   <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
 *     <Input />
 *   </Form.Item>
 * </ProForm>
 */
import { Modal, Form } from "antd";
import type { FormInstance } from "antd/es/form";
import { useCallback, type ReactNode } from "react";

interface ProFormProps<T> {
  /** 模态框是否打开 */
  open: boolean;
  /** 编辑中的对象（null = 新增模式） */
  editingItem: T | null;
  /** 实体中文名，如 "用户"、"角色" */
  titleLabel: string;
  /** Ant Design Form 实例 */
  form: FormInstance;
  /** 确认按钮 loading 状态 */
  submitting: boolean;
  /** 表单提交回调 */
  onFinish: () => Promise<void>;
  /** 取消回调 */
  onCancel: () => void;
  /** 模态框宽度 */
  width?: number;
  /** 表单内容 */
  children: ReactNode;
}

/**
 * 通用模态框表单
 */
export function ProForm<T>({
  open,
  editingItem,
  titleLabel,
  form,
  submitting,
  onFinish,
  onCancel,
  width = 560,
  children,
}: ProFormProps<T>) {
  const title = editingItem ? "编辑" + titleLabel : "新增" + titleLabel;

  const handleOk = useCallback(async () => {
    try {
      // 校验表单
      await form.validateFields();
    } catch {
      // 校验失败时 Ant Design 自动滚动到错误字段，无需额外处理
      return;
    }
    await onFinish();
  }, [form, onFinish]);

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={width}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        {children}
      </Form>
    </Modal>
  );
}
