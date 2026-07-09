/**
 * Ant Design 6 主题配置
 *
 * 提供亮色和暗色两套主题，通过 appStore.theme 动态切换。
 * 品牌色使用银行系蓝色 #1677ff。
 *
 * @see https://ant.design/docs/react/customize-theme
 */
import type { ThemeConfig } from "antd";

/** 亮色主题配置 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#1677ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    borderRadius: 6,
    fontSize: 14,
    wireframe: false,
  },
  components: {
    Table: {
      headerBg: "#fafafa",
      headerBorderRadius: 6,
    },
    Menu: {
      itemBorderRadius: 6,
    },
    Card: {
      paddingLG: 20,
    },
  },
};

/** 暗色主题配置 */
export const darkThemeConfig: ThemeConfig = {
  algorithm: undefined, // will be overridden at runtime with theme.darkAlgorithm
  token: {
    colorPrimary: "#1677ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Table: {
      headerBg: "#1f1f1f",
      headerBorderRadius: 6,
    },
    Menu: {
      darkItemBg: "#141414",
    },
  },
};