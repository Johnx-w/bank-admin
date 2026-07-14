import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署：资源路径加仓库名前缀
  // 如果你的仓库名不是 bank-admin，请改为 '/你的仓库名/'
  base: "/bank-admin/",
  server: {
    port: 5173,
  },
});