import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

// 对齐 tsconfig 的 "@/*" -> 项目根，使单测可用同样的导入路径。
export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
