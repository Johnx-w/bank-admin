/**
 * 系统配置页面
 */
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Form,
  InputNumber,
  Typography,
  message,
  Space,
} from "antd";
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { fetchSystemConfig, saveSystemConfig } from "../../api/system";
import type { SystemConfig } from "../../types/system";

/** 配置项描述映射 */
const CONFIG_DESCRIPTIONS: Record<string, string> = {
  maxLoginAttempts: "用户连续登录失败超过此次数后，账户将被自动锁定。",
  sessionTimeout: "用户无操作超时后自动退出（单位：秒）。",
  auditRetentionDays: "审计日志自动清理前的保留天数。",
  autoFreezeThreshold: "连续失败尝试次数达到该值后，账户自动冻结。",
};

export default function ConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchSystemConfig();
      setConfigs(res.data);
      const initial: Record<string, string | number> = {};
      for (const c of res.data) {
        initial[c.key] = parseInt(c.value, 10);
      }
      form.setFieldsValue(initial);
    } catch {
      setError("加载配置失败，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const updated: Partial<SystemConfig>[] = configs.map((c) => ({
        key: c.key,
        value: String(values[c.key]),
        description: c.description,
        updatedAt: new Date().toISOString(),
        updatedBy: "当前用户",
      }));
      await saveSystemConfig(updated as SystemConfig[]);
      message.success("系统配置已保存");
      loadConfig();
    } catch {
      // 校验失败
    } finally {
      setSaving(false);
    }
  }, [form, configs, loadConfig]);

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Typography.Text type="danger">{error}</Typography.Text>
        <br />
        <Button onClick={loadConfig} style={{ marginTop: 12 }}>重试</Button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Text style={{ fontSize: 14, color: "#8c8c8c" }}>
          修改配置后需点击保存按钮生效。
        </Typography.Text>
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadConfig}>
            刷新
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            保存配置
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        {configs.map((config) => (
          <Form.Item
            key={config.key}
            name={config.key}
            label={config.description}
            extra={
              <Typography.Text type="secondary">
                {CONFIG_DESCRIPTIONS[config.key] || ""}
              </Typography.Text>
            }
            rules={[{ required: true, message: "请输入" + config.description }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} max={99999} />
          </Form.Item>
        ))}
      </Form>
    </div>
  );
}
