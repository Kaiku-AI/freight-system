"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SIDEBAR_ITEMS } from "@/lib/modules";
import { useAuth } from "@/lib/store";

import NavIcon from "./NavIcons";

// shell 外的公开路由（不套导航、不需登录）。
const PUBLIC_PATHS = ["/login"];

// 顶部页签条（还原云海橙色页签条「模块 / 工作台 / 最近打开」）。
// 仅「模块」真实（指向模块导航主页，是任意子页回主页的入口）；其余装饰。
const TOP_TABS = [
  { label: "模块", href: "/", real: true },
  { label: "工作台", href: "/unavailable", real: false },
  { label: "最近打开", href: "/unavailable", real: false },
];

// 页签条右侧灰字：当前所在页面名（还原云海「≡ 业务统计」位）。
function crumbLabel(pathname: string): string {
  if (pathname.startsWith("/jobs/new")) return "新建整箱";
  if (pathname === "/jobs") return "作业列表";
  if (pathname.startsWith("/jobs")) return "整箱作业";
  if (pathname.startsWith("/unavailable")) return "暂未开放";
  return "海运出口";
}

// 全局 shell（DESIGN §7.2，布局对齐云海见 UI.md）：
// 蓝色软件栏 + 橙色页签条 + 左侧模块列表，所有受保护页共用。
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

  // 「模块」页签在模块导航主页及其下作业页均高亮（是回主页的入口）。
  const onModule = pathname === "/" || pathname.startsWith("/jobs");

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      {/* 蓝色软件栏（还原云海）：云朵 logo + 品牌名 + 右侧用户/退出 */}
      <header className="flex h-12 shrink-0 items-center bg-gradient-to-r from-topbar to-topbar-dark text-white">
        <Link href="/" className="flex items-center gap-2.5 px-5">
          <CloudLogo className="h-7 w-7" />
          <span className="text-base font-semibold tracking-wide">国际货运代理</span>
        </Link>

        <div className="ml-auto flex items-center gap-4 px-5 text-sm">
          <span className="text-white/90">{username}</span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded border border-white/30 px-3 py-1 text-white/90 transition-colors hover:bg-white/15"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* 橙色页签条（还原云海）：模块（深色激活）/ 工作台 / 最近打开 + 右侧当前页名 */}
      <div className="flex h-9 shrink-0 items-stretch border-b border-line bg-white">
        <nav className="flex items-stretch bg-accent">
          {TOP_TABS.map((t) => {
            const active = t.real && onModule;
            return (
              <Link
                key={t.label}
                href={t.href}
                className={`flex items-center px-5 text-sm transition-colors ${
                  active
                    ? "bg-ink font-medium text-white"
                    : "text-white hover:bg-black/10"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5 px-4 text-sm text-faint">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {crumbLabel(pathname)}
        </div>
      </div>

      <div className="flex flex-1">
        {/* 左侧模块列表（云海 17 项，平铺无分组）：海运出口 → 模块导航主页，其余跳 /unavailable */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-white">
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
            {SIDEBAR_ITEMS.map((item) => {
              // 海运出口涵盖模块导航主页与其下的作业（/jobs）页面。
              const active = item.key === "sea-export" && onModule;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-2.5 border-l-[3px] px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-brand bg-brand-soft font-medium text-brand"
                      : "border-transparent text-body hover:bg-canvas"
                  }`}
                >
                  <NavIcon name={item.key} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 用户区 */}
          <div className="flex shrink-0 items-center gap-3 border-t border-line px-5 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-medium text-brand">
              {username?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-medium text-ink">{username}</span>
              <span className="block text-[11px] text-muted">操作员</span>
            </span>
          </div>
        </aside>

        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}

// 云朵 logo（还原云海软件栏图标）。
function CloudLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}
