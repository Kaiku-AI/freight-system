// 侧栏导航线性图标（还原 Penpot 左栏图标风格：1.8px 描边、圆角、currentColor）。
// 按 SIDEBAR_GROUPS 的 item.key 取用。

type IconProps = { className?: string };

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-[18px] w-[18px]"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons: Record<string, (p: IconProps) => React.ReactElement> = {
  // 工作台 — layout-grid
  workbench: (p) => (
    <Svg className={p.className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  // 海运出口 — ship
  "sea-export": (p) => (
    <Svg className={p.className}>
      <path d="M12 10.2V14M12 2v3" />
      <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
      <path d="M19.4 20A11.6 11.6 0 0 0 21 14l-8.2-3.6a2 2 0 0 0-1.6 0L3 14a11.6 11.6 0 0 0 1.6 6" />
      <path d="M2 21c.6.5 1.2 1 2.5 1s2-.5 2.5-1 1.2-1 2.5-1 2 .5 2.5 1 1.2 1 2.5 1 2-.5 2.5-1 1.2-1 2.5-1 2 .5 2.5 1" />
    </Svg>
  ),
  // 海运进口 — anchor
  "sea-import": (p) => (
    <Svg className={p.className}>
      <path d="M12 22V8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      <circle cx="12" cy="5" r="3" />
    </Svg>
  ),
  // 本地业务 — map-pin
  local: (p) => (
    <Svg className={p.className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  // 财务管理 — credit-card
  finance: (p) => (
    <Svg className={p.className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  ),
  // 基础数据 — database
  "base-data": (p) => (
    <Svg className={p.className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </Svg>
  ),
  // 系统设置 — settings-2
  settings: (p) => (
    <Svg className={p.className}>
      <path d="M20 7h-9M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </Svg>
  ),
};

export default function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name];
  return Icon ? Icon({ className }) : null;
}
