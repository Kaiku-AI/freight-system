import Link from "next/link";

// 统一占位页（DESIGN §6）：未开放模块点进来都到这，仅一句提示，无列表数据。
export default function Unavailable() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <p className="text-lg font-medium text-zinc-700">暂未开放</p>
      <p className="mt-2 text-sm text-zinc-400">该模块正在规划中，敬请期待。</p>
      <Link
        href="/"
        className="mt-6 rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        返回主页
      </Link>
    </div>
  );
}
