import Link from "next/link";

// 统一占位页（DESIGN §6）：未开放模块点进来都到这，仅一句提示，无列表数据。
export default function Unavailable() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-2xl">
        🚧
      </span>
      <p className="mt-5 text-lg font-semibold text-ink">暂未开放</p>
      <p className="mt-2 text-sm text-muted">该模块正在规划中，敬请期待。</p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-line-strong px-4 py-2 text-sm text-body transition-colors hover:bg-canvas"
      >
        返回主页
      </Link>
    </div>
  );
}
