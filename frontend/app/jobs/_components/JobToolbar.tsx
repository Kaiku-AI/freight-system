"use client";

import BookingAction from "./BookingAction";
import { ToolbarDivider, ToolbarGhost } from "./Toolbar";

// 作业窗体次级工具栏（云海「编辑/订舱模板/费用确认…」行，经 JobWindow 的 toolbar 槽渲染）。三态：
// - new ：保存/放弃可点（提交/取消）；动作灰显——订舱是对「已落库作业单」发起的动作，新建尚未保存。
// - edit：保存/放弃可点；动作可点。
// - view：以「编辑」打头（进入编辑态）；动作可点——查看时也能发起订舱。
export default function JobToolbar({
  mode,
  submitting,
  onCancel,
  onEdit,
}: {
  mode: "new" | "edit" | "view";
  submitting?: boolean;
  onCancel?: () => void;
  onEdit?: () => void;
}) {
  return (
    <>
      {mode === "view" ? (
        <button
          type="button"
          onClick={onEdit}
          className="rounded bg-brand px-4 py-1 text-[13px] font-medium whitespace-nowrap text-white transition-colors hover:bg-brand-dark"
        >
          编辑
        </button>
      ) : (
        <>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-brand px-4 py-1 text-[13px] font-medium whitespace-nowrap text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-line-strong bg-white px-4 py-1 text-[13px] whitespace-nowrap text-body transition-colors hover:bg-canvas"
          >
            放弃
          </button>
        </>
      )}
      <ToolbarDivider />
      <ToolbarGhost items={["订舱模板 ▾", "费用确认 ▾", "相关操作 ▾"]} />
      {mode === "new" ? <ToolbarGhost items={["动作 ▾"]} /> : <BookingAction />}
      <ToolbarGhost
        items={["刷新", "数据交换 ▾", "通知 ▾", "打印", "工作流 ▾", "附件", "历史", "系统功能 ▾"]}
      />
    </>
  );
}
