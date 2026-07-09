/**
 * Ant Design 6 主题配置
 * 品牌色使用银行系蓝色，#1677ff 系 Ant Design 默认蓝，
 * 如需定制品牌色，修改 token.colorPrimary 即可
 *
 * @see https://ant.design/docs/react/customize-theme
 */
import type { ThemeConfig } from 'antd';

/** 系统主题配置对象 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',           // 品牌主色
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,                     // 统一圆角
    fontSize: 14,
    wireframe: false,                    // 使用填充风格而非线框
  },
  components: {
    Table: {
      headerBg: '#fafafa',
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