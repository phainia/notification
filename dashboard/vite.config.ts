import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 部署:Cloudflare Pages(根路径),前面套 Cloudflare Access 做登录。
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
});
