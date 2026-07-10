import type { ReactNode } from "react";
import { Button, Tooltip } from "antd";
import type { ButtonProps } from "antd/es/button";
import { usePermissionStore } from "../../stores/permissionStore";

interface PermissionBtnProps extends ButtonProps {
  /** 权限码，如 "user:create" */
  permCode: string;
  /** 无权限时是否隐藏按钮（默认 true），false 时显示禁用状态 */
  hideWhenNoPerm?: boolean;
  children: ReactNode;
}

/**
 * 权限控制按钮
 *
 * 根据当前用户的权限码控制按钮的显示和禁用状态。
 * 无权限时默认隐藏按钮，可设置 hideWhenNoPerm=false 改为禁用。
 *
 * 规则依据：js-early-exit（有权限时直接渲染按钮）
 *
 * @example
 * <PermissionBtn permCode="user:create" type="primary">
 *   新增用户
 * </PermissionBtn>
 */
export function PermissionBtn({ permCode, hideWhenNoPerm = true, children, ...rest }: PermissionBtnProps) {
  const hasPermission = usePermissionStore((s) => s.hasPermission(permCode));

  if (hasPermission) {
    return <Button {...rest}>{children}</Button>;
  }

  if (hideWhenNoPerm) {
    return null;
  }

  return (
    <Tooltip title="暂无权限">
      <Button disabled {...rest}>
        {children}
      </Button>
    </Tooltip>
  );
}