// 工具栏基础件（还原云海窗体工具栏）。
// 装饰按钮仅展示样子、本期不可点；真实可用的按钮（保存/放弃/新建/删除等）由各页面自行渲染，与这些并排。

// 真实/装饰按钮共用的扁平文字样式（云海工具栏无边框、密排）。
export const toolbarBtnCls =
  "rounded px-1.5 py-0.5 text-[13px] leading-5 whitespace-nowrap transition-colors";

// 装饰按钮：不可点；muted 用于云海里灰显的项（如 船东确认/放箱确认/开船确认）。
export function ToolbarGhost({ items, muted = false }: { items: string[]; muted?: boolean }) {
  return (
    <>
      {items.map((label) => (
        <button
          key={label}
          type="button"
          disabled
          title="暂未开放"
          className={`${toolbarBtnCls} cursor-not-allowed select-none ${
            muted ? "text-faint" : "text-body"
          }`}
        >
          {label}
        </button>
      ))}
    </>
  );
}

// 工具栏内的竖向分隔线。
export function ToolbarDivider() {
  return <span className="mx-0.5 h-4 w-px shrink-0 self-center bg-line-strong/60" />;
}

// 窗体蓝色标题栏（云海「整箱/海运出口」条）：左标题、右侧可放小字说明。
export function WindowTitleBar({
  title,
  caption,
}: {
  title: string;
  caption?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-topbar to-topbar-dark px-4 py-2 text-white">
      <span className="text-lg font-semibold tracking-wide">{title}</span>
      {caption && <span className="flex items-center gap-2 text-xs text-white/90">{caption}</span>}
    </div>
  );
}
