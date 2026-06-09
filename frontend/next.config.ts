import type { NextConfig } from "next";

// 本地开发把 /api/* 代理到本地 FastAPI，免跨域（DESIGN §3，Phase 2 备注）。
// 后端端口默认 8000；若本机被占用（如 Docker），用 BACKEND_ORIGIN 覆盖，例如：
//   BACKEND_ORIGIN=http://localhost:8001 npm run dev
// 线上由 vercel.json 把 /api/* 重写到 Python 函数，故仅 dev 生效。
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
