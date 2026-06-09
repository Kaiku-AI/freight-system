import Link from "next/link";

import { groupedModules } from "@/lib/modules";

// 主页 / 模块导航（DESIGN §6/§7.1）：按 group 渲染卡片，全部可点。
// enabled 进真实页面；未开放统一跳 /unavailable。
export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">模块导航</h1>

      <div className="flex flex-col gap-8">
        {groupedModules().map(({ group, items }) => (
          <section key={group}>
            <h2 className="mb-3 text-sm font-medium text-zinc-500">{group}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((m) => (
                <Link
                  key={m.key}
                  href={m.enabled ? m.href : "/unavailable"}
                  className="group rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
                >
                  <span className="text-base font-medium text-zinc-900">{m.name}</span>
                  {!m.enabled && (
                    <span className="mt-1 block text-xs text-zinc-400">暂未开放</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
