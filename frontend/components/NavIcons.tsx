// 侧栏导航线性图标（还原云海左栏图标风格：1.8px 描边、圆角、currentColor）。
// 按 SIDEBAR_ITEMS 的 item.key 取用。

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
  // 我的工作台 — monitor
  workbench: (p) => (
    <Svg className={p.className}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
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
  // 空运出口 — 纸飞机（朝上）
  "air-export": (p) => (
    <Svg className={p.className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </Svg>
  ),
  // 空运进口 — 纸飞机（俯冲，旋转 90°）
  "air-import": (p) => (
    <Svg className={p.className}>
      <g transform="rotate(90 12 12)">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </g>
    </Svg>
  ),
  // 陆运操作 — truck
  road: (p) => (
    <Svg className={p.className}>
      <path d="M14 17V7a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2" />
      <path d="M14 17H9" />
      <path d="M14 9h3.5a1 1 0 0 1 .8.4l2.5 3.3a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-1" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </Svg>
  ),
  // 铁路运输 — train
  rail: (p) => (
    <Svg className={p.className}>
      <rect x="5" y="3" width="14" height="13" rx="2" />
      <path d="M5 10h14M12 3v7" />
      <path d="M8 16l-2 4M16 16l2 4" />
      <path d="M9 13h.01M15 13h.01" />
    </Svg>
  ),
  // 本地业务 — map-pin
  local: (p) => (
    <Svg className={p.className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  // 业务操作 — clipboard-check
  "biz-ops": (p) => (
    <Svg className={p.className}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </Svg>
  ),
  // 仓库管理 — warehouse
  warehouse: (p) => (
    <Svg className={p.className}>
      <path d="M22 8.5V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.5a1 1 0 0 1 .6-.9l9-4.1a1 1 0 0 1 .8 0l9 4.1a1 1 0 0 1 .6.9Z" />
      <path d="M6 21v-9h12v9" />
      <path d="M6 15h12M6 18h12" />
    </Svg>
  ),
  // 集装箱管理 — container
  container: (p) => (
    <Svg className={p.className}>
      <rect x="2" y="7.5" width="20" height="11" rx="1" />
      <path d="M6.5 10.5v5M11 10.5v5M15.5 10.5v5" />
      <path d="m4 7.5 2-3h12l2 3" />
    </Svg>
  ),
  // PO管理 — file-text
  po: (p) => (
    <Svg className={p.className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 13h8M8 17h5" />
    </Svg>
  ),
  // 运价管理 — calculator
  pricing: (p) => (
    <Svg className={p.className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
    </Svg>
  ),
  // 财务管理 — credit-card
  finance: (p) => (
    <Svg className={p.className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  ),
  // 客户管理 — users
  customer: (p) => (
    <Svg className={p.className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
