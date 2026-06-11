import { JOB_TABS } from "@/lib/modules";

// 整箱作业页签条（DESIGN §1：子页签只留位不实现）。
// 受控组件：点击切换 active；未实现页签在本区域内显示「暂未开放」，不跳走、不丢表单。
export default function JobTabs({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap border-b border-line">
      {JOB_TABS.map((tab) => {
        const isActive = tab.name === active;
        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => onSelect(tab.name)}
            className={`-mb-px border-b-2 px-3 pb-2.5 text-sm transition-colors ${
              isActive
                ? "border-brand font-medium text-brand"
                : "border-transparent text-muted hover:text-brand"
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}

// 未实现页签的占位内容（在页签区域内显示，不跳 /unavailable）。
export function TabPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <rect x="2.5" y="7.5" width="19" height="5" rx="1" />
          <path d="M7 7.5 4 12.5M12.5 7.5 9.5 12.5M18 7.5 15 12.5" />
          <path d="M6 12.5V21M18 12.5V21" />
        </svg>
      </span>
      <p className="text-sm font-medium text-ink">「{name}」暂未开放</p>
      <p className="text-xs text-muted">该子页签暂未开放。</p>
    </div>
  );
}

// 默认页签（当前唯一已实现内容）。
export const DEFAULT_TAB = "托单信息";
