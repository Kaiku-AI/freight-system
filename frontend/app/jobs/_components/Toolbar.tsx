// 装饰性工具栏按钮（还原 Penpot 顶部工具栏）：仅展示样子，本期不可点。
// 真实可用的按钮（保存/放弃/新建/删除等）由各页面自行渲染，与这些并排。
export function ToolbarGhost({ items }: { items: string[] }) {
  return (
    <>
      {items.map((label) => (
        <button
          key={label}
          type="button"
          disabled
          title="暂未开放"
          className="cursor-not-allowed rounded-lg border border-line px-3 py-1.5 text-sm text-muted select-none"
        >
          {label}
        </button>
      ))}
    </>
  );
}

// 工具栏内的竖向分隔线。
export function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-line" />;
}
