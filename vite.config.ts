import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 需要 /bank-admin/，Docker/Nginx 部署传 VITE_BASE=/
  base: process.env.VITE_BASE || "/bank-admin/",
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * 手动拆包策略：
         * - vendor-react:  React + ReactDOM + Router（稳定，长期缓存）
         * - vendor-antd:    Ant Design 组件库（~500KB gzip）
         * - vendor-echarts: ECharts 图表库（~300KB gzip）
         * - vendor-xlsx:    SheetJS Excel（按需加载）
         *
         * 配合路由懒加载，首屏只需 vendor-react + vendor-antd + Login 页面 chunk。
         */
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }
            if (id.includes("antd") || id.includes("@ant-design")) {
              return "vendor-antd";
            }
            if (id.includes("echarts")) {
              return "vendor-echarts";
            }
            if (id.includes("xlsx")) {
              return "vendor-xlsx";
            }
          }
        },
      },
    },
  },
});