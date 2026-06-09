"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { enabledModules } from "@/lib/modules";
import { useAuth } from "@/lib/store";

// shell 外的公开路由（不套导航、不需登录）。
const PUBLIC_PATHS = ["/login"];

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
  useEffect(() => setMounted(true), []);

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
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
        <Link href="/" className="block px-5 py-4 text-lg font-semibold tracking-tight">
          海运出口订舱
        </Link>
        <nav className="flex flex-col gap-1 px-3">
          {enabledModules().map((m) => {
            const active = pathname === m.href || pathname.startsWith(m.href + "/");
            return (
              <Link
                key={m.key}
                href={m.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {m.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-4 border-b border-zinc-200 bg-white px-6">
          <span className="text-sm text-zinc-500">{username}</span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            退出登录
          </button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
