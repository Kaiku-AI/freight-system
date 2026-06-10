"use client";

import { useEffect, useRef, useState } from "react";

// 「动作 ▾」下拉项：点「订舱」走发送动画并提示「订舱指令已发送」，其余给「暂不可用」（demo 用）。
const ACTIONS = ["订舱", "退舱", "锁定作业", "作废", "转工作号"] as const;

type Phase = "sending" | "sent";

// 编辑表单工具栏里的「动作」菜单：模拟发订舱 EDI 的过程，发完只告知「指令已发送」。
// 不回填表单、不声称订舱成功、不接真实 EDI、不动后端。
export default function BookingAction() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
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

  // 「暂不可用」提示 1.8s 自动消失。
  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(""), 1800);
    return () => window.clearTimeout(t);
  }, [hint]);

  function startBooking() {
    setOpen(false);
    setPhase("sending");
    window.setTimeout(() => setPhase("sent"), 1300); // 模拟向船公司发送的时延
  }

  function pick(action: string) {
    if (action === "订舱") return startBooking();
    setOpen(false);
    setHint(`「${action}」暂不可用`);
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

      {phase && <BookingModal phase={phase} onClose={() => setPhase(null)} />}
    </div>
  );
}

// 订舱弹窗：发送中（转圈）→ 已发送（仅告知指令送达，不写订舱成功、不回填）。
function BookingModal({ phase, onClose }: { phase: Phase; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 shadow-xl">
        {phase === "sending" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-brand" />
            <p className="text-sm text-body">正在向船公司发送订舱 EDI…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-brand">
                <path
                  d="M5 12.5l4.2 4.2L19 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="text-base font-semibold text-ink">订舱指令已发送</h3>
            <p className="text-sm leading-relaxed text-body">已向船公司发出订舱请求。</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 rounded-lg bg-brand px-6 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
