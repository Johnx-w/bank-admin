import { Spin } from "antd";

interface PageLoadingProps {
  /** 加载提示文本 */
  tip?: string;
}

/**
 * 页面级别加载组件
 *
 * 在页面数据加载期间展示居中 Spin，替代多个分散的加载指示器。
 * 规则依据：rendering-conditional-render（使用三元判断显示）
 */
export function PageLoading({ tip = "加载中..." }: PageLoadingProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
}