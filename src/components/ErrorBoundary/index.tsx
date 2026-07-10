import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button, Result } from "antd";

interface Props {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  lastChildKey: string;
}

/**
 * 错误边界组件
 *
 * 捕获子组件渲染阶段的 JavaScript 错误，防止整个页面白屏。
 * 路由切换时通过 getDerivedStateFromProps 检测 children 变化并自动重置，
 * 避免一个页面报错后所有其他页面也显示错误页。
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, lastChildKey: "" };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /** 路由切换时自动清除错误状态 */
  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
    const childType =
      nextProps.children &&
      typeof nextProps.children === "object" &&
      "type" in nextProps.children
        ? String((nextProps.children as { type?: unknown }).type || "")
        : "";
    if (prevState.hasError && childType !== prevState.lastChildKey) {
      return { hasError: false, error: null, lastChildKey: childType };
    }
    if (childType !== prevState.lastChildKey) return { lastChildKey: childType };
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  handleReset = () => { this.setState({ hasError: false, error: null }); };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <Result
        status="error"
        title="页面出现异常"
        subTitle={this.state.error?.message || "未知错误"}
        extra={<Button type="primary" onClick={this.handleReset}>重试</Button>}
      />
    );
  }
}
