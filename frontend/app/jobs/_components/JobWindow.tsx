import Link from "next/link";

import { ToolbarDivider, ToolbarGhost, WindowTitleBar, toolbarBtnCls } from "./Toolbar";

// 整箱作业「窗体」（还原云海）：蓝色标题栏 + 顶级工具栏 + 主页签（作业激活）+ 次级工具栏 + 内容区。
// 真实按钮：新建（→ /jobs/new）、删除（明细页传 onDelete）、关闭（onClose，返回/取消）；其余装饰。
// 次级工具栏（保存/放弃/编辑/动作等真实按钮）由各页面经 toolbar 传入。
const MAIN_TABS = ["装箱", "费用", "凭证", "代理对账单", "附件", "物流可视化"];

export default function JobWindow({
  caption,
  onDelete,
  onClose,
  toolbar,
  children,
}: {
  caption?: React.ReactNode; // 标题栏右侧小字（如 作业号 + 状态）
  onDelete?: () => void;
  onClose?: () => void;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-white">
      <WindowTitleBar title="整箱/海运出口" caption={caption} />

      {/* 顶级工具栏（云海）：新建/删除/关闭真实，其余装饰 */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-line bg-white px-2 py-1">
        <Link
          href="/jobs/new"
          className={`${toolbarBtnCls} text-body hover:bg-canvas hover:text-brand`}
        >
          新建
        </Link>
        <ToolbarGhost items={["复制"]} />
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className={`${toolbarBtnCls} text-body hover:bg-[#fef2f4] hover:text-star`}
          >
            删除
          </button>
        ) : (
          <ToolbarGhost items={["删除"]} />
        )}
        <ToolbarDivider />
        <ToolbarGhost items={["航线确认", "接受委托", "接单分配"]} />
        <ToolbarGhost items={["船东确认", "放箱确认", "开船确认"]} muted />
        <ToolbarGhost items={["单证锁定", "关闭作业", "内部利润分析", "自定义按钮", "动作 ▾", "打印"]} />
        <ToolbarDivider />
        <ToolbarGhost items={["上行", "下行"]} />
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={`${toolbarBtnCls} text-body hover:bg-canvas hover:text-brand`}
          >
            关闭
          </button>
        ) : (
          <ToolbarGhost items={["关闭"]} />
        )}
      </div>

      {/* 主页签（仅「作业」为当前内容，其余装饰） */}
      <div className="flex items-end gap-1 overflow-x-auto border-b border-panel-line bg-canvas px-2 pt-1.5">
        <span className="-mb-px rounded-t border border-panel-line border-b-white bg-white px-4 py-1 text-[13px] font-semibold text-ink">
          作业
        </span>
        {MAIN_TABS.map((t) => (
          <button
            key={t}
            type="button"
            disabled
            title="暂未开放"
            className="cursor-not-allowed rounded-t border border-transparent px-3.5 py-1 text-[13px] whitespace-nowrap text-body select-none"
          >
            {t}
          </button>
        ))}
      </div>

      {toolbar && (
        <div className="relative z-10 flex items-center gap-1 overflow-x-auto overflow-y-visible border-b border-[#f5c98e] bg-accent-soft px-2 py-1">
          {toolbar}
        </div>
      )}

      <div className="space-y-2.5 p-3">{children}</div>
    </div>
  );
}
