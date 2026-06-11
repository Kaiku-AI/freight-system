import Link from "next/link";

import { MODULES, groupedModules } from "@/lib/modules";

// 主页 / 模块导航（DESIGN §6/§7.1）：白卡内按 group 渲染模块链接，全部可点。
// enabled 进真实页面（主色）；未开放统一跳 /unavailable（弱化文本）。
export default function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-2xl border border-line bg-white p-7 shadow-[0_1px_2px_rgba(22,24,35,0.04)]">
        {/* 卡片头 */}
        <div className="flex items-start justify-between border-b border-line pb-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand">
              海
            </span>
            <div>
              <h1 className="text-lg font-semibold text-ink">海运出口</h1>
              <p className="mt-0.5 text-sm text-muted">
                国际货运代理 · 选择要进入的功能模块
              </p>
            </div>
          </div>
          <span className="rounded-full bg-canvas px-3 py-1 text-xs text-muted">
            共 {MODULES.length} 项功能
          </span>
        </div>

        {/* 分组 */}
        <div className="flex flex-col gap-8 pt-6">
          {groupedModules().map(({ group, color, items }) => (
            <section key={group}>
              <h2 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {group}
                <span className="text-xs font-normal text-faint">{items.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {items.map((m) => (
                  <Link
                    key={m.key}
                    href={m.enabled ? m.href : "/unavailable"}
                    className={`text-sm transition-colors ${
                      m.enabled
                        ? "font-medium text-brand hover:text-brand-dark"
                        : "text-body hover:text-brand"
                    }`}
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
