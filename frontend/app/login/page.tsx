"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/store";

// 极简登录（DESIGN §5/§6）：固定账号，后端比对，无 token、无会话。
// 通过即在客户端置登录标记并跳主页。
export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail ?? "登录失败");
        return;
      }
      login(username);
      router.replace("/");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 左：品牌展示（DESIGN §0 Penpot 样式参考）*/}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-[#6fd3fa] p-14 text-white lg:flex">
        <span className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-white/10" />
        <span className="absolute right-10 bottom-24 h-44 w-44 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">
            运
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-semibold">国际货运代理</span>
            <span className="block text-xs text-white/70">海运进出口业务平台</span>
          </span>
        </div>

        <div className="relative">
          <h2 className="text-4xl leading-tight font-bold">
            让每一票货物
            <br />
            高效流转
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/80">
            一站式管理海运进出口订舱、报关、提单与费用结算，让业务全流程在线协同、清晰可控。
          </p>
          <ul className="mt-9 space-y-3.5 text-sm text-white/90">
            {["订舱 · 报关 · 提单全链路打通", "实时掌握作业进度与费用结算", "多角色协同，数据安全可控"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">© 2026 国际货运代理 · 海运进出口业务平台</p>
      </div>

      {/* 右：登录表单 */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink">账户登录</h1>
          <p className="mt-2 text-sm text-muted">请登录您的账户，继续管理您的货代业务</p>

          <label className="mt-8 mb-1.5 block text-sm font-medium text-body">账号</label>
          <input
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand"
            placeholder="请输入用户名 / 邮箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />

          <label className="mt-4 mb-1.5 block text-sm font-medium text-body">密码</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg border border-line bg-white py-2.5 pr-11 pl-3.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
              title={showPassword ? "隐藏密码" : "显示密码"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-brand"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-star">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "登录中…" : "登 录"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16.7 16.7 0 0 1-3 4.1" />
      <path d="M6.5 6.8C3.9 8.6 2.5 12 2.5 12s3.5 7 9.5 7a9 9 0 0 0 4-.9" />
    </svg>
  );
}
