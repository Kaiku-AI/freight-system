import Link from "next/link";

import { groupedModules } from "@/lib/modules";

// 主页 / 模块导航（DESIGN §6/§7.1，样式对齐云海模块面板）：
// 组名统一主色蓝，组下功能链接流式密排，全部可点。
// enabled 进真实页面（橙色高亮）；未开放统一跳 /unavailable（普通文本）。
export default function Home() {
  return (
    <div className="relative border border-line bg-white px-6 py-5">
      {/* 装饰关闭钮（还原云海面板右上 ×，本期不可点） */}
      <button
        type="button"
        disabled
        title="暂未开放"
        className="absolute top-3 right-4 cursor-not-allowed text-lg leading-none text-faint select-none"
        aria-label="关闭"
      >
        ×
      </button>

      <div className="flex flex-col gap-6">
        {groupedModules().map(({ group, items }) => (
          <section key={group}>
            <h2 className="mb-3 text-sm font-bold text-brand">{group}</h2>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {items.map((m) => (
                <Link
                  key={m.key}
                  href={m.enabled ? m.href : "/unavailable"}
                  className={`text-sm transition-colors ${
                    m.enabled
                      ? "font-medium text-accent hover:underline"
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
  );
}
