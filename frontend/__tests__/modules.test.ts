import { describe, expect, it } from "vitest";

import { MODULES, SIDEBAR_ITEMS, enabledModules, groupedModules } from "@/lib/modules";

// 模块清单是导航唯一数据源（DESIGN §7.1）；分组/过滤是派生逻辑，纯函数回归基线。
describe("modules", () => {
  it("enabledModules 只返回已开放模块", () => {
    const enabled = enabledModules();
    expect(enabled.every((m) => m.enabled)).toBe(true);
    expect(enabled.map((m) => m.key)).toEqual(["job-new", "job-list"]);
  });

  it("groupedModules 覆盖全部模块且不漏不重", () => {
    const flat = groupedModules().flatMap((g) => g.items);
    expect(flat).toHaveLength(MODULES.length);
    expect(new Set(flat.map((m) => m.key)).size).toBe(MODULES.length);
  });

  it("SIDEBAR_ITEMS 对齐云海左栏 17 个模块，仅海运出口为真实入口", () => {
    expect(SIDEBAR_ITEMS).toHaveLength(17);
    expect(new Set(SIDEBAR_ITEMS.map((i) => i.key)).size).toBe(17);
    const real = SIDEBAR_ITEMS.filter((i) => i.href !== "/unavailable");
    expect(real.map((i) => i.key)).toEqual(["sea-export"]);
    expect(real[0].href).toBe("/");
  });

  it("groupedModules 保持分组首次出现的顺序（对齐云海模块面板 6 组）", () => {
    expect(groupedModules().map((g) => g.group)).toEqual([
      "委托单",
      "操作",
      "本地业务",
      "费用",
      "文档",
      "统计分析",
    ]);
  });
});
