/**
 * Ant Design 6 主题配置
 *
 * 提供亮色和暗色两套主题，通过 appStore.theme 动态切换。
 * 品牌色使用银行系蓝色 #1677ff，暗色主题针对金融场景优化对比度和可读性。
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
    colorInfo: "#1677ff",
    borderRadius: 6,
    fontSize: 14,
    wireframe: false,
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f0f2f5",
    colorBorderSecondary: "#f0f0f0",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#001529",
      triggerBg: "#002140",
    },
    Menu: {
      darkItemBg: "#001529",
      darkSubMenuItemBg: "#000c17",
      itemBorderRadius: 6,
    },
    Table: {
      headerBg: "#fafafa",
      headerBorderRadius: 6,
      rowHoverBg: "#f5f7fa",
    },
    Card: {
      paddingLG: 20,
    },
    Modal: {
      borderRadiusLG: 8,
    },
  },
};

/** 暗色主题配置 */
export const darkThemeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#1677ff",
    colorSuccess: "#49aa19",
    colorWarning: "#d89614",
    colorError: "#dc4446",
    colorInfo: "#1668dc",
    borderRadius: 6,
    fontSize: 14,
    wireframe: false,
    colorBgContainer: "#141414",
    colorBgLayout: "#000000",
    colorBgElevated: "#1f1f1f",
    colorBgSpotlight: "#2a2a2a",
    colorBorder: "#303030",
    colorBorderSecondary: "#303030",
    colorText: "rgba(255, 255, 255, 0.85)",
    colorTextSecondary: "rgba(255, 255, 255, 0.65)",
    colorTextTertiary: "rgba(255, 255, 255, 0.45)",
    colorFill: "rgba(255, 255, 255, 0.15)",
    colorFillSecondary: "rgba(255, 255, 255, 0.06)",
    colorFillTertiary: "rgba(255, 255, 255, 0.04)",
  },
  components: {
    Layout: {
      headerBg: "#141414",
      siderBg: "#000000",
      triggerBg: "#1f1f1f",
    },
    Menu: {
      darkItemBg: "#000000",
      darkSubMenuItemBg: "#0a0a0a",
      darkItemSelectedBg: "#1677ff",
      darkItemHoverBg: "rgba(22, 119, 255, 0.15)",
      itemBorderRadius: 6,
    },
    Table: {
      headerBg: "#1f1f1f",
      headerBorderRadius: 6,
      rowHoverBg: "rgba(255, 255, 255, 0.04)",
      borderColor: "#303030",
    },
    Card: {
      paddingLG: 20,
      colorBgContainer: "#141414",
    },
    Modal: {
      borderRadiusLG: 8,
      colorBgElevated: "#1f1f1f",
    },
    Input: {
      colorBgContainer: "#1f1f1f",
      colorBorder: "#434343",
    },
    Select: {
      colorBgContainer: "#1f1f1f",
      colorBorder: "#434343",
    },
    DatePicker: {
      colorBgContainer: "#1f1f1f",
      colorBorder: "#434343",
    },
    Button: {
      defaultBg: "#1f1f1f",
      defaultBorderColor: "#434343",
    },
    Tag: {
      defaultBg: "rgba(255, 255, 255, 0.04)",
      defaultColor: "rgba(255, 255, 255, 0.65)",
    },
    Drawer: {
      colorBgElevated: "#141414",
    },
    Descriptions: {
      colorBgContainer: "rgba(255, 255, 255, 0.02)",
      borderColor: "#303030",
    },
  },
};
