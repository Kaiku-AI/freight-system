// 模块清单：导航的唯一数据源（DESIGN §7.1）。
// 主页卡片、侧边导航、「暂未开放」全部由此派生，不在别处硬编码。
// 新增模块 = 建好页面后把对应项 enabled 改 true（或加一项），主页与导航自动出现。
export type ModuleItem = {
  key: string; // 唯一标识
  name: string; // 中文名
  href: string; // 路由；未开放项点击统一跳 /unavailable
  group: string; // 分组
  enabled: boolean; // false → 主页显示「暂未开放」、导航不列
};

export const MODULES: ModuleItem[] = [
  { key: "job-new", name: "新建整箱", href: "/jobs/new", group: "委托单", enabled: true },
  { key: "job-list", name: "作业列表", href: "/jobs", group: "操作", enabled: true },
  // 以下为规划中（Penpot 标紫），enabled:false → 点击跳统一占位页 /unavailable
  { key: "mbl", name: "MB/L列表", href: "#", group: "操作", enabled: false },
  { key: "hbl", name: "HB/L列表", href: "#", group: "操作", enabled: false },
  { key: "container", name: "集装箱", href: "#", group: "操作", enabled: false },
  { key: "warehouse", name: "进仓记录", href: "#", group: "本地业务", enabled: false },
  { key: "customs", name: "报关信息", href: "#", group: "本地业务", enabled: false },
  { key: "fee", name: "费用列表", href: "#", group: "费用", enabled: false },
];

export const enabledModules = () => MODULES.filter((m) => m.enabled);

// 按 group 顺序分组，供主页卡片渲染（保持 MODULES 中首次出现的分组顺序）。
export function groupedModules(): { group: string; items: ModuleItem[] }[] {
  const order: string[] = [];
  const map = new Map<string, ModuleItem[]>();
  for (const m of MODULES) {
    if (!map.has(m.group)) {
      map.set(m.group, []);
      order.push(m.group);
    }
    map.get(m.group)!.push(m);
  }
  return order.map((group) => ({ group, items: map.get(group)! }));
}
