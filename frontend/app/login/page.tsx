"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/store";

// 极简登录（DESIGN §5/§6，布局对齐云海登录页）：固定账号，后端比对，无 token、无会话。
// 通过即在客户端置登录标记并跳主页。
// 仅「用户代码/密码」真实参与登录；分支机构代码、部门、模拟登录、二维码为装饰（还原云海排面）。
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

  // 拆出无底色基类：密码框要换浅蓝底（云海），避免 bg-white 与 bg-brand-soft 同名冲突。
  const inputBase =
    "w-full rounded border border-line px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand";
  const inputCls = `${inputBase} bg-white`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-4xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
        {/* 左：品牌（云朵 logo + 标语 + 库标识） */}
        <div className="flex shrink-0 flex-col items-center gap-3 text-center">
          <CloudMark className="h-24 w-24 text-brand" />
          <span className="text-4xl font-bold tracking-wide text-brand">国际货运代理</span>
          <span className="text-sm tracking-wide text-muted">引领物流进入智能时代</span>
          <span className="text-sm font-medium text-accent">测试库</span>
        </div>

        {/* 右：登录表单（标签左、输入右密排，还原云海四行） */}
        <form onSubmit={onSubmit} className="relative w-full max-w-md pt-12 lg:pt-14">
          {/* 装饰二维码（云海扫码登录位，本期不可点） */}
          <button
            type="button"
            disabled
            title="暂未开放"
            aria-label="扫码登录"
            className="absolute top-0 right-0 cursor-not-allowed text-faint select-none"
          >
            <QrIcon className="h-9 w-9" />
          </button>

          <FormRow label="分支机构代码">
            <input
              name="branch_code"
              defaultValue=""
              disabled
              className={`${inputBase} bg-field text-muted`}
            />
          </FormRow>

          <FormRow label="用户代码">
            <input
              className={inputCls}
              placeholder="请输入用户代码"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </FormRow>

          <FormRow label="密码">
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputBase} bg-brand-soft pr-10`}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                title={showPassword ? "隐藏密码" : "显示密码"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:text-brand"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </FormRow>

          <FormRow label="部门">
            <select
              name="department"
              defaultValue="管理部"
              disabled
              className={`${inputBase} bg-field text-muted`}
            >
              <option value="管理部">管理部</option>
            </select>
          </FormRow>

          {error && <p className="mt-4 pl-28 text-sm text-star">{error}</p>}

          <div className="mt-9 flex items-center justify-between pl-2">
            <button
              type="button"
              disabled
              title="暂未开放"
              className="cursor-not-allowed text-sm text-muted underline underline-offset-4 select-none"
            >
              模拟登录
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-brand px-16 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "登录中…" : "登 录"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 表单行：标签左（定宽右对齐）+ 控件右。
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 flex items-center gap-3 first:mt-0">
      <span className="w-24 shrink-0 text-right text-sm text-body">{label}</span>
      {children}
    </label>
  );
}

// 云朵品牌图标（呼应顶栏 logo）。
function CloudMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function QrIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
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
