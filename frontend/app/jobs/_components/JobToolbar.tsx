"use client";

import BookingAction from "./BookingAction";
import { ToolbarDivider, ToolbarGhost } from "./Toolbar";

// 作业表单/明细顶部工具栏（还原 Penpot）。三态：
// - new ：保存/放弃可点（提交/取消）；动作灰显——订舱是对「已落库作业单」发起的动作，新建尚未保存。
// - edit：保存/放弃可点；动作可点。
// - view：保存/放弃灰显不可点（查看模式，需点「编辑」才可改）；动作可点——查看时也能发起订舱。
export default function JobToolbar({
  mode,
  submitting,
  onCancel,
}: {
  mode: "new" | "edit" | "view";
  submitting?: boolean;
  onCancel?: () => void;
}) {
  const canSave = mode !== "view";
  const canAct = mode !== "new";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3">
      {canSave ? (
        <>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line-strong px-4 py-1.5 text-sm text-body transition-colors hover:bg-canvas"
          >
            放弃
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled
            title="查看模式，点「编辑」后可保存"
            className="cursor-not-allowed rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white opacity-50 select-none"
          >
            保存
          </button>
          <button
            type="button"
            disabled
            title="查看模式，点「编辑」后可放弃"
            className="cursor-not-allowed rounded-lg border border-line-strong px-4 py-1.5 text-sm text-muted select-none"
          >
            放弃
          </button>
        </>
      )}
      <ToolbarDivider />
      <ToolbarGhost items={["订舱模板 ▾", "相关操作 ▾"]} />
      {canAct ? <BookingAction /> : <ToolbarGhost items={["动作 ▾"]} />}
      <ToolbarGhost items={["数据交换 ▾", "通知 ▾", "系统功能 ▾"]} />
    </div>
  );
}
