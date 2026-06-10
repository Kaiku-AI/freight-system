"use client";

import { useEffect, useRef, useState } from "react";

// 「动作 ▾」下拉项：点「订舱」提示「订舱指令已发送」，其余给「暂不可用」（demo 用，看起来丰满）。
const ACTIONS = ["订舱", "退舱", "锁定作业", "作废", "转工作号"] as const;

// 编辑表单工具栏里的「动作」菜单：点项给一句轻提示，不落库、不接真实 EDI。
export default function BookingAction() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // 点菜单外关闭。
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // 提示 1.8s 自动消失。
  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(""), 1800);
    return () => window.clearTimeout(t);
  }, [hint]);

  function pick(action: string) {
    setOpen(false);
    setHint(action === "订舱" ? "订舱指令已发送" : `「${action}」暂不可用`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-body transition-colors hover:bg-canvas"
      >
        动作 ▾
      </button>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg">
          {ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => pick(a)}
              className="block w-full px-3 py-1.5 text-left text-sm text-body transition-colors hover:bg-brand-soft hover:text-brand"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {hint && (
        <div className="absolute top-full left-0 z-20 mt-1 rounded-lg bg-ink px-3 py-1.5 text-xs whitespace-nowrap text-white shadow">
          {hint}
        </div>
      )}
    </div>
  );
}
