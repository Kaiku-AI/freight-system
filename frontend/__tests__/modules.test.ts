import { describe, expect, it } from "vitest";

import { MODULES, enabledModules, groupedModules } from "@/lib/modules";

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

  it("groupedModules 保持分组首次出现的顺序", () => {
    expect(groupedModules().map((g) => g.group)).toEqual([
      "委托单",
      "操作",
      "本地业务",
      "费用",
    ]);
  });
});
