"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SIDEBAR_GROUPS } from "@/lib/modules";
import { useAuth } from "@/lib/store";

import NavIcon from "./NavIcons";

// shell 外的公开路由（不套导航、不需登录）。
const PUBLIC_PATHS = ["/login"];

// 顶栏面包屑：当前模块名（首段「海运出口」恒为模块导航主页入口）。
function crumbLabel(pathname: string): string | null {
  if (pathname.startsWith("/jobs/new")) return "新建整箱";
  if (pathname === "/jobs") return "作业列表";
  if (pathname.startsWith("/jobs/")) return "作业明细";
  if (pathname === "/unavailable") return "暂未开放";
  return null; // 模块导航主页
}

// 全局 shell（DESIGN §7.2）：侧边导航 + 顶栏退出登录，所有受保护页共用。
// 登录态在客户端（Zustand+localStorage），故 gate 也在客户端：
// 未登录访问受保护页 → 跳 /login；已登录访问 /login → 跳主页。
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loggedIn = useAuth((s) => s.loggedIn);
  const username = useAuth((s) => s.username);
  const logout = useAuth((s) => s.logout);
  const [mounted, setMounted] = useState(false);

  // 等 persist 从 localStorage 水合后再判断，避免 SSR/首帧闪烁与误跳转。
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!mounted) return;
    if (!loggedIn && !isPublic) router.replace("/login");
    if (loggedIn && isPublic) router.replace("/");
  }, [mounted, loggedIn, isPublic, router]);

  if (!mounted) return null;

  // 登录页：裸渲染，不套导航。
  if (isPublic) return <>{children}</>;

  // 受保护页但未登录：正在跳转，先不渲染内容。
  if (!loggedIn) return null;

  return (
    <div className="flex min-h-screen bg-canvas text-body">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white">
        {/* 品牌区 */}
        <Link href="/" className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            运
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-ink">海运出口订舱</span>
            <span className="block text-[11px] text-muted">Sea Freight Export</span>
          </span>
        </Link>

        {/* 顶层导航（业务中心/系统）：海运出口 → 模块导航主页，其余跳 /unavailable */}
        <nav className="flex flex-col gap-4 px-3">
          {SIDEBAR_GROUPS.map((g) => (
            <div key={g.label} className="flex flex-col gap-0.5">
              <p className="px-3 pb-1 text-[11px] font-medium tracking-wide text-faint">
                {g.label}
              </p>
              {g.items.map((item) => {
                // 海运出口涵盖模块导航主页与其下的作业（/jobs）页面。
                const active =
                  item.key === "sea-export" &&
                  (pathname === "/" || pathname.startsWith("/jobs"));
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-brand-soft font-medium text-brand"
                        : "text-body hover:bg-canvas"
                    }`}
                  >
                    <NavIcon name={item.key} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 用户区 */}
        <div className="mt-auto flex items-center gap-3 border-t border-line px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-medium text-brand">
            {username?.[0]?.toUpperCase() ?? "U"}
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-medium text-ink">{username}</span>
            <span className="block text-[11px] text-muted">操作员</span>
          </span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-line bg-white px-6">
          {/* 面包屑：任意模块页都可由此回模块导航主页 */}
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/" className="font-medium text-brand transition-colors hover:text-brand-dark">
              海运出口
            </Link>
            {crumbLabel(pathname) && (
              <>
                <span className="text-faint">/</span>
                <span className="text-muted">{crumbLabel(pathname)}</span>
              </>
            )}
          </nav>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded-lg border border-line-strong px-3.5 py-1.5 text-sm text-body transition-colors hover:bg-canvas"
          >
            退出登录
          </button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
