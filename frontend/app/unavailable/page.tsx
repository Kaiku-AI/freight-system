import Link from "next/link";

// 统一占位页（DESIGN §6）：未开放模块点进来都到这，仅一句提示，无列表数据。
export default function Unavailable() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded border border-line-strong bg-white text-muted">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden
        >
          <rect x="2.5" y="7.5" width="19" height="5" rx="1" />
          <path d="M7 7.5 4 12.5M12.5 7.5 9.5 12.5M18 7.5 15 12.5" />
          <path d="M6 12.5V21M18 12.5V21" />
        </svg>
      </span>
      <p className="mt-5 text-lg font-semibold text-ink">暂未开放</p>
      <p className="mt-2 text-sm text-muted">该模块暂未开放。</p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-line-strong px-4 py-2 text-sm text-body transition-colors hover:bg-canvas"
      >
        返回主页
      </Link>
    </div>
  );
}
