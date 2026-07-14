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
});