// 导航的唯一数据源（DESIGN §7.1，界面对齐云海见 UI.md）。三处由此派生，不在别处硬编码：
//   1) 侧边栏顶层导航 SIDEBAR_ITEMS（云海左栏 17 个模块，无分组平铺）；
//   2) 主页「海运出口」功能网格 MODULES（云海模块面板 6 组，组名统一主色）；
//   3) 整箱作业页签 JOB_TABS（云海整箱表单下部页签）。
// 未实现项一律 href=/unavailable（点进去显示「暂未开放」）；新增模块改 enabled/补一项即可。
export type ModuleItem = {
  key: string; // 唯一标识
  name: string; // 中文名
  href: string; // 路由；未开放项点击统一跳 /unavailable
  group: string; // 分组（对齐云海模块面板分组）
  enabled: boolean; // false → 主页弱化显示、点击跳 /unavailable
};

// 图标由 components/NavIcons.tsx 按 key 渲染（线性 SVG，还原云海左栏图标）。
export type NavItem = { key: string; name: string; href: string };

// ---- 1) 侧边栏顶层导航（云海左栏 17 个模块，平铺无分组）----
// 仅「海运出口」指向真实主页（模块导航），其余跳 /unavailable。
export const SIDEBAR_ITEMS: NavItem[] = [
  { key: "workbench", name: "我的工作台", href: "/unavailable" },
  { key: "sea-export", name: "海运出口", href: "/" },
  { key: "sea-import", name: "海运进口", href: "/unavailable" },
  { key: "air-export", name: "空运出口", href: "/unavailable" },
  { key: "air-import", name: "空运进口", href: "/unavailable" },
  { key: "road", name: "陆运操作", href: "/unavailable" },
  { key: "rail", name: "铁路运输", href: "/unavailable" },
  { key: "local", name: "本地业务", href: "/unavailable" },
  { key: "biz-ops", name: "业务操作", href: "/unavailable" },
  { key: "warehouse", name: "仓库管理", href: "/unavailable" },
  { key: "container", name: "集装箱管理", href: "/unavailable" },
  { key: "po", name: "PO管理", href: "/unavailable" },
  { key: "pricing", name: "运价管理", href: "/unavailable" },
  { key: "finance", name: "财务管理", href: "/unavailable" },
  { key: "customer", name: "客户管理", href: "/unavailable" },
  { key: "base-data", name: "基础数据", href: "/unavailable" },
  { key: "settings", name: "系统设置", href: "/unavailable" },
];

// ---- 2) 主页「海运出口」功能网格（云海模块面板）----
// 已实现的两页 → 真实路由；其余全部 enabled:false（点击跳 /unavailable）。

// 已实现项：名称 → { 稳定 key, 真实路由 }。
const ENABLED: Record<string, { key: string; href: string }> = {
  新建整箱: { key: "job-new", href: "/jobs/new" },
  作业列表: { key: "job-list", href: "/jobs" },
};

// 功能项按分组铺开（顺序/分组照 Penpot 主页）。
const GRID: Record<string, string[]> = {
  委托单: [
    "新建整箱", "新建拼箱作业", "新建拼箱委托", "新建委拼", "新建整拼", "新建散杂货",
    "新建虚订舱", "虚订舱列表", "客户订舱", "新建客户订舱", "自动订舱", "上船信息",
    "物流可视化列表",
  ],
  操作: [
    "作业列表", "委托单列表", "MB/L列表", "HB/L列表", "AMS列表", "ISF列表",
    "集装箱列表", "分公司委配", "进口转出口", "订舱更正", "Feedback", "舱单确认",
    "舱单导入列表", "新建舱单导入", "提单更正", "船东舱单列表", "自拼装箱", "船期表",
    "导入箱号", "导入船东参考编号",
  ],
  本地业务: [
    "仓储列表", "仓储明细", "拖车列表", "拖车明细", "班列列表", "商检列表",
    "保险列表", "报关信息", "目的港服务",
  ],
  费用: [
    "费用列表", "应收费用", "应付费用", "所有凭证", "发票", "应收凭证",
    "应付凭证", "代理对账单", "Agentpafreight", "堆存费", "滞箱费",
  ],
  文档: ["放单管理"],
  统计分析: ["作业箱量分析", "作业利润分析", "委托人利润分析"],
};

export const MODULES: ModuleItem[] = Object.entries(GRID).flatMap(([group, names]) =>
  names.map((name) => {
    const e = ENABLED[name];
    return {
      key: e?.key ?? `${group}-${name}`,
      name,
      href: e?.href ?? "/unavailable",
      group,
      enabled: Boolean(e),
    };
  }),
);

export const enabledModules = () => MODULES.filter((m) => m.enabled);

// 按 group 顺序分组，供主页网格渲染（保持 GRID 中的分组顺序；组名统一主色蓝，对齐云海）。
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

// ---- 3) 整箱作业页签（云海整箱表单下部页签）----
// 仅「托单信息」已实现；其余页签在本卡片内显示「暂未开放」占位。
export const JOB_TABS: { name: string; enabled: boolean }[] = [
  { name: "托单信息", enabled: true },
  { name: "其它信息", enabled: false },
  { name: "船东舱单", enabled: false },
  { name: "货物", enabled: false },
  { name: "PO Item", enabled: false },
  { name: "集装箱", enabled: false },
  { name: "目的港服务", enabled: false },
  { name: "MB/L", enabled: false },
  { name: "HB/L", enabled: false },
];
