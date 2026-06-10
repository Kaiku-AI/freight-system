"use client";

import { useEffect, useRef, useState } from "react";

import { makeBookingReceipt, type BookingReceipt } from "./fields";

// 「动作 ▾」下拉项：仅「订舱」真实可用，其余点击给「暂不可用」提示（demo 用，看起来丰满）。
const ACTIONS = ["订舱", "退舱", "锁定作业", "作废", "转工作号"] as const;

type Phase = "sending" | "received";

// 编辑表单工具栏里的「动作」菜单：模拟发订舱 EDI → 收回执 → 回填表单（不自动保存）。
export default function BookingAction({
  onApply,
}: {
  onApply: (receipt: BookingReceipt) => void; // 把回执回填进父表单 state
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
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
    setReceipt(makeBookingReceipt());
    setPhase("sending");
    window.setTimeout(() => setPhase("received"), 1300); // 模拟船公司处理时延
  }

  function pick(action: string) {
    if (action === "订舱") return startBooking();
    setOpen(false);
    setHint(`「${action}」暂不可用`);
  }

  function apply() {
    if (receipt) onApply(receipt);
    setPhase(null);
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

      {phase && (
        <BookingModal
          phase={phase}
          receipt={receipt}
          onApply={apply}
          onClose={() => setPhase(null)}
        />
      )}
    </div>
  );
}

// 订舱弹窗：发送中（转圈）/ 已收回执（展示订舱号 + 回填）。
function BookingModal({
  phase,
  receipt,
  onApply,
  onClose,
}: {
  phase: Phase;
  receipt: BookingReceipt | null;
  onApply: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl">
        {phase === "sending" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
            <p className="text-sm text-body">正在向船公司发送订舱 EDI…</p>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold text-ink">已收到船公司回执</h3>
            <p className="mt-2 text-sm text-body">
              船公司已确认舱位，船东订舱号{" "}
              <span className="font-medium text-brand">{receipt?.so_no}</span>。
            </p>
            <p className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-xs leading-relaxed text-brand">
              回填会写入订舱号并勾选「订舱确认」，但<strong>不会自动保存</strong>——请核对后点左上角【保存】方才生效。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line-strong px-4 py-1.5 text-sm text-body transition-colors hover:bg-canvas"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onApply}
                className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                回填到表单
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
