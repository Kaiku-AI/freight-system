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
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [hintPos, setHintPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bookingTimer = useRef<number | null>(null);

  function updatePopoverPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = {
      top: rect.bottom + 4,
      left: rect.left,
    };
    setMenuPos(pos);
    setHintPos(pos);
  }

  // 点菜单外关闭。
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open && !hint) return;
    updatePopoverPosition();
    window.addEventListener("scroll", updatePopoverPosition, true);
    window.addEventListener("resize", updatePopoverPosition);
    return () => {
      window.removeEventListener("scroll", updatePopoverPosition, true);
      window.removeEventListener("resize", updatePopoverPosition);
    };
  }, [open, hint]);

  // 「暂不可用」提示 1.8s 自动消失。
  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(""), 1800);
    return () => window.clearTimeout(t);
  }, [hint]);

  useEffect(() => {
    return () => {
      if (bookingTimer.current != null) window.clearTimeout(bookingTimer.current);
    };
  }, []);

  function startBooking() {
    setOpen(false);
    setPhase("sending");
    if (bookingTimer.current != null) window.clearTimeout(bookingTimer.current);
    bookingTimer.current = window.setTimeout(() => setPhase("sent"), 1300); // 模拟向船公司发送的时延
  }

  function pick(action: string) {
    if (action === "订舱") return startBooking();
    setOpen(false);
    updatePopoverPosition();
    setHint(`「${action}」暂不可用`);
  }

  return (
    <div ref={ref} className="relative z-30">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updatePopoverPosition();
          setOpen((o) => !o);
        }}
        className="rounded px-2 py-1 text-[13px] leading-5 font-medium whitespace-nowrap text-accent transition-colors hover:bg-white hover:text-accent"
      >
        动作 ▾
      </button>

      {open && (
        <div
          className="fixed z-50 w-36 overflow-hidden rounded border border-line-strong bg-white py-1 shadow-lg"
          style={menuPos}
        >
          {ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => pick(a)}
              className="block w-full px-3 py-1.5 text-left text-sm text-body transition-colors hover:bg-accent-soft hover:text-accent"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {hint && (
        <div
          className="fixed z-50 rounded bg-ink px-3 py-1.5 text-xs whitespace-nowrap text-white shadow"
          style={hintPos}
        >
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div className="w-full max-w-[420px] overflow-hidden rounded border border-line-strong bg-white shadow-xl">
        <div className="bg-gradient-to-r from-topbar to-topbar-dark px-4 py-2 text-sm font-semibold text-white">
          订舱指令
        </div>
        {phase === "sending" ? (
          <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-brand" />
            <p className="text-sm text-body">正在向船公司发送订舱 EDI…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-panel-line bg-white">
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
              className="mt-1 rounded bg-brand px-8 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
