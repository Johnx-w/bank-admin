import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button, Result } from "antd";

interface Props {
  children: ReactNode;
  /** 错误回调，用于上报日志 */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 *
 * 捕获子组件渲染阶段的 JavaScript 错误，防止整个页面白屏。
 * 只捕获渲染阶段错误，不捕获事件处理器和异步错误。
 *
 * 规则依据：js-early-exit（未出错时正常渲染子组件）
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  /** 重置错误状态 */
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Result
        status="error"
        title="页面出现异常"
        subTitle={this.state.error?.message || "未知错误"}
        extra={
          <Button type="primary" onClick={this.handleReset}>
            重试
          </Button>
        }
      />
    );
  }
}