# 海运出口订舱系统（云海简化版）— 设计文档

> 参考资料：《云海软件》操作手册——海运出口（86 页）；UI 样式稿见 Penpot。
> 目标：带数据库、可本地跑通、可 Vercel 部署上线的 Web 版核心功能系统
> 状态：**设计稿（待最终确认后写代码）**
>
> **UI 与文档的关系**：Penpot 上的 UI 只提供**样式/视觉设计**参考；功能范围、字段、交互逻辑**以本文档为准**。Penpot 中部分页面/功能模块是计划要做的，部分是不做的——不做的不予理会。**若 Penpot 与本文档冲突，以本文档为准。**

---

## 1. 需求范围（已确认）

### 本期要做（核心就是「作业单」）
系统从「**新建整箱**」开始：**一单 = 一个「作业」(job)**，是整个系统的脊梁；集装箱、进仓、拖车、报关、提单、费用等都是挂在作业上的子项，需要什么加什么。本期把脊梁做通：

1. **写入** —— 新建/编辑「作业单（整箱作业）」基本订舱信息。
2. **查询/读取** —— 按条件查询作业列表，点开看作业明细，读出基本定舱信息。
3. **删除** —— 在列表/明细删除作业（带二次确认）。
4. **数据库** —— 轻量即可，支撑上面的读写（Supabase Postgres）。
5. **登录 / 退出登录** —— 极简登录页（固定 `test` 账号、**不做鉴权**，不发 token、不做权限）；并提供「退出登录」（清除前端登录标记、回到登录页）。

> 一句话：登录页（固定账号、无鉴权）→ 新建/编辑作业 → 作业列表查询 → 作业明细读取 → 删除作业 → 可退出登录。就这些。

### 本期明确不做（往后放）
- 财务/费用（费用录入、对账、开票、销账等整块）
- 报关
- 用户权限、鉴权、多公司/分公司区分
- 拼箱 / 委拼 / 整拼 / 代拉代报 / 预订舱（**只做整柜 FCL**）

### 已分析但本期不实现（数据模型预留，标注 TODO）
- **进仓 / 仓储记录**（作业 1→N）
- **集装箱信息**（作业 1→N）
- **提单 MBL/HBL**（作业 1→N）

> 设计上为这三块预留扩展点（都挂在 `job` 下），本期不建表、不做界面。详见第 8 节。
> 整箱表单中除「基本信息 + 托单信息」外的子页签（船东舱单 / 货物 / PO Item / 集装箱 / 额外费用 / MB/L / HB/L / 利润减少）同属此类未来子模块，本期仅保留页签位、不实现。

---

## 2. 技术选型

| 层 | 选型 | 说明 |
|---|---|---|
| 前端 | **Next.js (App Router) + TypeScript** | 部署 Vercel 原生最顺 |
| UI | Tailwind CSS（可选 shadcn/ui） | 轻量，表单/表格够用 |
| 前端取数 | **原生 `fetch` + `useState`（不用 SWR）** | 体量小，封装小 hook 复用即可 |
| 前端客户端状态 | **Zustand** | 团队习惯；只管登录标记等 UI 状态 |
| 后端 | **FastAPI (Python) + SQLModel** | 前后端分离；SQLModel = Pydantic + SQLAlchemy |
| 数据库 | **Supabase（Postgres）** | 团队已在用，保持一致；见下方说明 |
| 登录 | **固定账号，无鉴权** | 账号写死在环境变量；前端校验通过即放行，不发 token |
| 部署 | Vercel（前端 + Python Serverless Functions 同仓） | 一个项目、一个域名、无跨域 |

> 注意：FastAPI 在 Vercel 上是 serverless 按需拉起，需用 Supabase 的**连接池连接串**（Supavisor/pgBouncer，Transaction 模式，端口 6543），而非直连 5432，避免连接数被打爆。配置时处理。

---

## 3. 系统架构

```
┌─────────────────────────────────────────────┐
│                  Vercel 项目                  │
│                                               │
│  Next.js 前端 (/)         FastAPI 后端 (/api) │
│  ├ /login                 ├ /api/login        │
│  ├ /jobs       ──fetch──▶ ├ /api/jobs/*       │
│  └ /jobs/[id]             └ (无鉴权中间件)     │
└───────────────────────────┬───────────────────┘
                            │ SQLModel / asyncpg
                            ▼
                  ┌──────────────────┐
                  │ Supabase Postgres│
                  └──────────────────┘
```

代码前后端分离（`/frontend` 与 `/backend`），部署时同一 Vercel 项目托管，避免跨域。后端 REST 接口的 **URL 前缀仍是 `/api/*`**（前端调 `/api/jobs`），由 `vercel.json` 把 `/api/*` 重写路由到 `backend` 的 Python 函数——文件夹名与 URL 命名空间是两回事。

仓库结构（建议）：
```
freight-system/
├ frontend/                # Next.js
│  ├ app/
│  │  ├ layout.tsx         # 全局导航栏（含「退出登录」按钮）
│  │  ├ page.tsx           # 主页 / 模块导航（卡片入口，未开放模块点进去显示「暂未开放」）
│  │  ├ login/page.tsx     # 登录（固定账号）
│  │  └ jobs/
│  │     ├ page.tsx        # 作业列表（查询）
│  │     ├ new/page.tsx    # 新建作业（写入）
│  │     └ [id]/page.tsx   # 作业明细（读取 + 编辑）
│  └ lib/
│     ├ api.ts             # 原生 fetch 封装（getJobs/createJob...）
│     └ store.ts           # Zustand：登录标记 + 退出登录
├ backend/                 # FastAPI（URL 仍挂 /api/*，见 vercel.json）
│  ├ index.py              # ASGI 入口（Vercel Python Runtime）
│  ├ models.py             # SQLModel：job 表
│  ├ db.py                 # 引擎/会话（Supabase 连接池串）
│  └ routers/jobs.py
├ vercel.json
└ requirements.txt
```

---

## 4. 数据模型

本期**只建 1 张表 `job`**。登录免鉴权，账号写死在环境变量，无需 user 表。

### job（作业单 / 整箱作业）——核心实体

`job` 表平铺「基本信息」+「托单信息」两块字段；其余子页签（船东舱单 / 货物 / PO Item / 集装箱 / 额外费用 / MB/L / HB/L / 利润减少）属未来子模块（作业 1→N），本期不建表、不做界面（见 §8）。带 `*` 为必填。

**A. 基本信息**

| 字段 | 中文 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| id | | int PK | ✔ | |
| job_no | 作业号 | varchar | ✔ | 系统自动生成，唯一（`EXP+日期+流水`，见 §11） |
| operator | 操作员 | varchar | ✔ | |
| consignor | 委托人/客户 | varchar | ✔ | |
| customer_service | 客服 | varchar | ✔ | |
| sales | 销售员 | varchar | ✔ | |
| business_staff | 商务 | varchar | | |
| booking_date | 订舱日期 | date | | 默认当天 |
| booking_agent | 订舱代理 | varchar | | |
| carrier | 船东/船公司 | varchar | | |
| contract_no | 约号 | varchar | | 服务合约号 |
| vessel | 船名 | varchar | | |
| voyage | 航次 | varchar | | |
| route | 航线 | varchar | | |
| carrier_route | 船东航线 | varchar | | |
| so_no | 船东参考编号/订舱号 | varchar | | |
| etd | ETD日期（预计开船） | date | ✔ | |
| eta | ETA日期 | date | | |
| atd | ATD日期（实际开船） | date | | |
| port_in_date | 进港日期 | date | | |
| cutoff_date | 截单日期 | date | | |
| vgm_cutoff | VGM截止日期 | date | | |
| loading_time | 装船时间 | timestamp | | |
| business_type | 业务性质 | varchar | ✔ | 固定「整柜订舱」 |
| shipment_type | 出运类型 | varchar | | 固定「整箱」(FCL) |
| service_type | 服务类型 | varchar | | 装→卸，如 `CY-CY`（UI 为两段下拉） |
| solicit_type | 揽货方式 | varchar | | 如「本地自揽货」 |
| mbl_payment | MB付款方式 | varchar | ✔ | 预付/到付 |
| hbl_payment | HB付款方式 | varchar | | 预付/到付 |
| bl_type | 出单类型 | varchar | | `MBL` / `HBL` |
| bl_issue_type | 海运提单类型 | varchar | | 正本提单/电放/Seaway |
| original_bl_count | 正本提单份数 | int | | |
| copy_bl_count | 副本提单份数 | int | | |
| mbl_no | MB/L No. | varchar | | 本期仅存字段（提单子模块暂不做） |
| hbl_no | HB/L No. | varchar | | 同上 |
| contact | 联系人 | varchar | | |
| contact_phone | 电话 | varchar | | |
| contact_email | 邮件 | varchar | | |
| terminal | 码头 | varchar | | |
| customs_broker | 报关行 | varchar | | |
| hs_code | HSCode | varchar | | |
| schedule_ref | 船期表 | varchar | | 关联船期（选择器） |
| status | 出运状态 | varchar | | `draft`/`active`/`closed`（对应已订舱/已放舱/已开船等） |

**B. 服务/标志位**（均为 `bool`，默认 `false`；对应 UI 勾选框，列表的拖车/报关等列由此派生）

`trucking 拖车` / `warehousing 仓储` / `customs_declare 报关` / `inspection 商检` / `ams AMS` / `ens ENS` / `rail 火车` / `barge 驳船` / `transit_customs 转关` / `need_container 需用箱` / `free_storage 免堆存` / `yard_loading 堆场装箱` / `insurance 保险` / `advance_duty 代垫关税` / `fumigation 熏蒸` / `ddu DDU` / `ddp DDP` / `dap DAP`

**C. 托单信息**（整箱=单委托，平铺在 `job`；拼箱时这块下移到 `consignment`，见 §12.2）

| 字段 | 中文 | 类型 | 说明 |
|---|---|---|---|
| packages | 件数 | int | |
| package_unit | 计费单位 | varchar | 如 `CARTONS` |
| gross_weight | 毛重(KGS) | numeric | |
| volume | 体积(CBM) | numeric | |
| chargeable_weight | 计费重 | numeric | |
| inner_packages | 小件数 | int | |
| inner_package_type | 小包装 | varchar | |
| packages_in_words | 大写数量 | varchar | |
| cargo_type | 货物种类 | varchar | 普通/危险品/冷藏… |
| cargo_name | 品名 | varchar | |
| marks | 唛头 | text | |
| shipper | 发货人 | varchar | |
| shipper_detail | 发货人明细 | text | 名称/地址/联系方式 |
| ddc | DDC | varchar | 附加费标志 |
| baf | BAF | varchar | 附加费标志 |
| isps | ISPS | varchar | 附加费标志 |
| place_of_receipt_code | 收货地代码 | varchar | 如 `CNNGB` |
| place_of_receipt | 收货地 | varchar | 如 `NINGBO` |
| pre_carriage_pol | 前程起运港 | varchar | |
| pol_code | 起运港代码 | varchar | |
| pol | 起运港 | varchar | |
| transit_port_code | 中转港代码 | varchar | |
| pod_code | 卸货港代码 | varchar | |
| pod | 卸货港 | varchar | |
| place_of_delivery | 交货地 | varchar | |
| final_destination | 目的地 | varchar | 列表筛选用 |
| prepaid_at | 预付地点 | varchar | |
| collect_at | 到付地点 | varchar | |
| third_party_payment_at | 第三方付款地 | varchar | |
| telex_release_no | 电放号 | varchar | |
| container_summary | 箱型箱量 | varchar | 概要，如 `1x40HQ`（集装箱明细见子模块） |
| remarks | 备注 | text | |

**作业确认状态**（6 个独立勾选项）——用于记录该票作业的关键状态，互相之间**没有前后依赖关系**；新建/编辑页在顶部保存工具栏下方、基本信息上方用独立卡片展示 checkbox，作业列表也展示对应列。勾选即表示已确认，取消勾选即未确认；本期不记录确认时间。

| 字段 | 中文 | 类型 |
|---|---|---|
| booking_confirmed | 订舱确认 | bool default false |
| space_released | 放舱确认 | bool default false |
| container_released | 放箱确认 | bool default false |
| manifest_confirmed | 舱单确认 | bool default false |
| customs_released | 海关放行 | bool default false |
| sailing_confirmed | 开船确认 | bool default false |
| status | 总体状态 | varchar（`draft`/`active`/`closed`） |

**审计**

| 字段 | 类型 |
|---|---|
| created_at | timestamp |
| updated_at | timestamp |

---

## 5. API 设计（FastAPI，统一前缀 `/api`，无鉴权）

### 登录（极简）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/login` | 入参 `{username, password}`，与环境变量里的固定账号比对，返回 `{ok: true}`；不发 token、不做会话 |

> 前端登录通过后仅在客户端置一个「已登录」标记并跳转，纯演示性质。
> **退出登录无需后端接口**：纯前端清除登录标记（Zustand + localStorage）并跳回 `/login` 即可。

### 作业单（写入 + 查询/读取 + 删除）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/jobs` | 新建作业（自动生成 job_no） |
| GET | `/api/jobs` | 列表查询，支持过滤（对齐 UI 筛选条）：`job_no` / `consignor` / `vessel` / `voyage` / `mbl_no` / `pol` / `final_destination` / `status` / `booking_agent` / `etd_from` / `etd_to`，分页 |
| GET | `/api/jobs/{id}` | 作业明细（读取基本定舱信息） |
| PUT | `/api/jobs/{id}` | 编辑作业 |
| DELETE | `/api/jobs/{id}` | 删除作业（前端二次确认；删除后重拉列表） |

返回统一 JSON；错误用标准 HTTP 状态码 + `{detail}`。

---

## 6. 前端页面

| 路由 | 页面 | 对应需求 |
|---|---|---|
| `/login` | 登录页（固定 test 账号，无鉴权；密码框支持眼睛按钮切换明文/密文） | 需求 4 |
| `/` | **主页 / 模块导航**：各功能模块卡片入口；卡片均可点，已做的进入真实页面，未做的跳 `/unavailable` 占位页 | 入口 |
| `/unavailable` | **暂未开放占位页**：未开放模块点进来都到这，仅显示「暂未开放」提示，无列表数据 | 占位 |
| `/jobs` | **作业列表**：筛选条 + 表格（作业号/委托人/船名·航次/MB·L No./起运港/目的地/ETD/出运状态/订舱确认/放舱确认/放箱确认/舱单确认/海关放行/开船确认/拖车/报关等）+ 「新建」「删除」按钮（删除带二次确认） | 需求 2+3：查询/读取/删除 |
| `/jobs/new` | **新建整箱作业**：作业确认状态（独立卡片）+ 基本信息 + 服务标志 + 托单信息（必填项黄底/红星，字段以 §4 为准）；其余子页签（集装箱/MB·L/HB·L 等）暂未开放 | 需求 1：写入 |
| `/jobs/[id]` | **作业明细**：只读 + 编辑 | 需求 1+2 |

**主页采用「模块导航」（不是「工作台」）**：登录后进入主页，以卡片/入口列出系统各模块。本期只有「作业（整箱订舱）」可用；其余模块（进仓、集装箱、提单、报关、费用等）**卡片仍可点击**，点进去统一到 `/unavailable` 占位页，只显示「**暂未开放**」、无列表数据，等做到再把对应模块接上真实页面。

全局 Layout 含**导航栏**（只列已做的模块）和右上角「**退出登录**」按钮，所有页面共用。

交互参考手册：必填项黄底带 `*`；列表可按条件搜索；新建/明细编辑页在基本信息上方能勾选「订舱确认 / 放舱确认 / 放箱确认 / 舱单确认 / 海关放行 / 开船确认」，作业列表同步展示这 6 个确认状态；登录页密码框可切换明文/密文。

---

## 7. 前端架构与文件组织

采用「**模块导航**」结构（不是「工作台」/画布）：登录后进入**主页**（`/`），以模块卡片作为入口；全局 Layout 带顶部/侧边导航。本节定义前端组织约定——目标是「**加一个模块 = 照抄一份约定**」，不越加越乱。

### 7.1 模块清单：单一数据源（驱动主页 + 导航 + 暂未开放）

`lib/modules.ts` 是导航的**唯一数据源**，对齐 Penpot 主页结构派生三处，避免多处维护不一致：

1. **侧边栏顶层导航 `SIDEBAR_GROUPS`**（Penpot 左栏「业务中心 / 系统」）：工作台 / 海运出口 / 海运进口 / 本地业务 / 财务管理 + 基础数据 / 系统设置。仅「海运出口」指向真实主页 `/`（模块导航），其余 → `/unavailable`。海运出口在 `/` 与 `/jobs*` 下高亮——故任意模块页都能由侧栏回到模块导航（解决「进了模块回不去」）。
2. **主页「海运出口」功能网格 `MODULES`**（Penpot 主页 56 项，6 组 委托单/操作/本地业务/费用/文档/统计分析）：仅 `新建整箱→/jobs/new`、`作业列表→/jobs` 已实现（主色），其余 `enabled:false`（弱化显示、点击 → `/unavailable`）。分组色点由 `GROUP_COLOR` 派生，`groupedModules()` 返回 `{group,color,items}`。
3. **整箱作业页签 `JOB_TABS`**（Penpot 表单 tab）：托单信息 / 其它信息 / 船东舱单 / 货物 / PO Item / 集装箱 / 额外费用 / MB/L / HB/L / 利润减少。仅「托单信息」已实现；其余页签为受控切换，在**本卡片区域内**显示「暂未开放」占位（不跳走、不丢表单），对应 §1「子页签只留位不实现」。新建/明细页共用 `JobTabs`。

```ts
// lib/modules.ts（要点）
export type ModuleItem = { key; name; href; group; enabled };  // 网格项
export type NavItem = { key; name; icon; href };               // 侧栏项
export const SIDEBAR_GROUPS = [{ label:'业务中心', items:[...] }, { label:'系统', items:[...] }];
export const GROUP_COLOR = { 委托单:'#5b5bd6', 操作:'#e8833a', 本地业务:'#2bb6a3', 费用:'#e85d8c', 文档:'#8a6ad6', 统计分析:'#3a8ee8' };
export const MODULES: ModuleItem[] = /* 由分组名单 GRID 派生，已实现项映射真实路由 */;
export const JOB_TABS = [{ name:'托单信息', enabled:true }, /* …其余 enabled:false */];
```

- **新增模块**：把对应网格项映射到真实路由（或页签 `enabled` 改 `true`）即可，主页/侧栏/页签自动反映。
- **未开放统一占位**：网格项、页签、侧栏未实现项点击都到 `/unavailable`（只显示「暂未开放」，无列表数据）。

> 清单**列全** Penpot 的 56 项功能 + 7 项顶层导航 + 10 个表单页签（让界面铺满、贴合真实系统骨架），但**只有「新建整箱 / 作业列表 / 托单信息」是真实页面**，其余全部占位。**字段/路由以本文档为准，Penpot 仅供样式与信息架构参考。**

### 7.2 文件组织（按模块分目录，shell 与模块分离）

```
frontend/
├ app/
│  ├ layout.tsx            # 全局 shell：侧边导航 + 顶栏 + 退出登录，所有页共用
│  ├ page.tsx              # 主页 / 模块导航（消费 lib/modules.ts）
│  ├ login/page.tsx        # 登录（固定账号，shell 外）
│  ├ unavailable/page.tsx  # 「暂未开放」统一占位页（未开放模块点进来都到这）
│  └ jobs/                 # 「作业」模块——一个模块一个目录
│     ├ page.tsx           # 列表
│     ├ new/page.tsx       # 新建
│     ├ [id]/page.tsx      # 明细 / 编辑
│     └ _components/       # 仅本模块用的组件（JobForm、JobTable、FilterBar…）
├ components/              # 跨模块共享 UI（Button、Field、Card、StatusBadge…）
├ lib/
│  ├ api.ts               # 原生 fetch 封装（getJobs/createJob/updateJob/deleteJob…），统一 baseURL + 错误处理
│  ├ modules.ts           # 模块清单（见 7.1）
│  └ store.ts             # Zustand：登录标记 + 退出登录
└ types/
   └ job.ts               # Job 等类型定义（与后端 SQLModel / 第 4 节 job 表字段对齐）
```

约定：

- **模块自包含**：一个模块（如 `jobs`）的页面与私有组件都在自己目录下；`_components` 前缀下划线，不参与路由。
- **共享 vs 私有**：只有被 ≥2 个模块复用的组件才上移到 `components/`，否则留在模块内，避免过早抽象。
- **类型集中**：类型放 `types/`，与后端字段一一对应，改字段一处改、全局受益。
- **加新模块**：在 `app/` 下建模块目录 + 在 `lib/modules.ts` 加一项；不动 shell、不动架构。

### 7.3 状态边界：服务端数据 vs 客户端 UI 状态（绝不混用）

数据真正的家在 Supabase，前端只负责「按需把数据捞出来显示 / 写回去」。两类状态**分开处理、绝不混用**：

- **服务端数据（作业列表、明细）——原生 fetch，不用 SWR**：用原生 `fetch` + `useState`，请求统一封装在 `lib/api.ts` 复用；写操作（POST/PUT）成功后手动重新拉一次列表刷新。
- **客户端 UI 状态（登录标记 / 退出登录）——Zustand**：一个很小的 store 存「是否登录、用户名」+ localStorage 持久化（刷新不丢），无需 Provider；登录校验通过即置标记并跳 `/`（主页），导航栏「退出登录」清标记跳 `/login`，受保护页进入前检查登录态、未登录跳回登录页。
- **列表筛选条件——放 URL query 参数**：可分享、浏览器前进后退可用，不进全局 store。

> 原则：**Zustand 只管客户端 UI 状态，服务端数据归 fetch；两者不混。** 以后加集装箱/进仓/拼箱/批量选择等，同一套往上叠，不改架构。

---

## 8. 暂不实现模块的扩展分析（预留，都挂在 job 下）

本期不建表、不写界面，但结构已想清楚，未来平滑叠加：

**进仓 / 仓储记录 `warehouse_record`**（作业 1→N）
- 字段：`job_id`、`warehouse_no`(进仓单号)、`warehouse_name`、`plan_in_date`/`actual_in_date`、`container_no`/`container_type`/`seal_no`、`packages`/`gross_weight`/`volume`、`driver_name`/`driver_phone`/`truck_no`、`status`(计划/已进仓)、`remarks`。
- 升级方式：作业明细页加「进仓」子区，增/查/改。

**集装箱表 `container`**（作业 1→N）
- 字段：`job_id`、`container_no`(带校验)、`seal_no`、`container_type`、`packages`、`gross_weight`、`measurement`、`vgm`、`tare`。
- 升级后进仓记录的箱号字段改为 FK 关联本表。

**提单表 `bill_of_lading`**（作业 1→N，MBL/HBL）
- 字段：`job_id`、`bl_type`、`bl_no`、`shipper`、`consignee`、`notify_party`、`pol`、`pod`、`description`、`marks`、`packages/weight/volume`、`freight_terms`。
- 触发点：作业录入 MBL No./HBL No. 后可「自动创建提单」（手册逻辑）。

**再往后**：费用模块、报关模块、拼箱多委托结构、权限/多公司——均与本期 `job` 表兼容，作为独立模块叠加。

---

## 9. 部署方案（你要我直接部署上线）

单一 Vercel 项目：Next.js 前端 + FastAPI（Python Serverless Function，挂 `/api`），数据库 Supabase。

**到部署那一步我需要你提供：**
1. **Vercel 账号**：授权我部署，或给一个 Vercel Access Token；也可你自己 Import 仓库，我给保姆级步骤。
2. **Supabase 项目**：把**连接池连接串**（Settings → Database → Connection pooling，端口 6543）给我，配到 Vercel 环境变量；或授权我代为创建项目。
3. 代码托管：放到 Git 仓库（GitHub）便于持续部署。

**环境变量**：`DATABASE_URL`（Supabase 连接池串）、`TEST_USER`、`TEST_PASSWORD`。

**上线后交付**：可访问网址 + test 账号密码 + 简短使用说明。

> 安全：账号密码与数据库密钥统一走 Vercel 环境变量，不写死进代码或公开仓库。

---

## 10. 实施计划

1. 初始化仓库（Next.js + FastAPI + SQLModel；本地 SQLite 调试）。
2. 建 `job` 表；接通 Supabase；跑通读写。
3. 后端：`/api/login` + 作业 CRUD 接口；自测。
4. 前端：登录/退出登录 → 作业列表 → 新建作业 → 作业明细（Zustand 管登录态，原生 fetch 取数）。
5. 联调 + 基本校验（必填项、错误提示）。
6. 部署 Vercel + Supabase，线上冒烟测试，交付网址。

---

## 11. 已确认约定

1. `job_no` 编号规则：`EXP+日期+流水`，如 `EXP20260608-001`。
2. 登录账号：`test / test123`（写在环境变量，可随时改）。
3. 界面字段标签用中文，贴合手册。
4. 取数用原生 `fetch`（不用 SWR）；客户端状态用 Zustand；提供退出登录。

---

## 12. 未来扩展性：先做 job，后加模块

整个系统从「新建整箱」开始，**一单 = 一个 `job`**，是脊梁；其它模块都是挂在作业上的子项，需要什么加什么。只要这次把 `job` 这根脊梁做对，绝大多数模块都是低成本叠加。

### 12.1 模块叠加的两类难度

**简单（加一张挂在 `job` 下的子表 + 一个子页面即可）**：集装箱、进仓/仓储、拖车、提单 MBL/HBL。这些是作业的一对多子项，结构清晰、互不耦合，每个约半天到一天。

**需要单独立项评估**：

- **费用/财务**：手册里最重的一块——录入、审核、锁定、对账、开票、销账、凭证、对冲、预收预付，还涉及收入/成本/利润计算。是个独立子系统，不是「加张表」那么轻。
- **拼箱系（拼箱/委拼/整拼）**：引入「一个作业含多个委托人（主票/分票）」的结构，数据模型要从单层变两层。

### 12.2 拼箱/委拼/整拼怎么加（核心是一对多关系）

现在 `job` 是单层（一票 = 一个委托人，字段平铺），正好对应整柜。拼箱系的共同点是「一个作业里有多个委托人/分票」。关键改动只有一件事：**在 `job` 下加一张子表 `consignment`（委托单/分票），`job_id → job.id`，一对多。** 然后字段分两层：

- **作业级（主票，留在 `job`）**：船名航次、船公司、POL/POD、ETD、MBL、订舱/箱量等共享信息。
- **委托级（每票，挪到 `consignment`）**：委托人、品名、件毛体、唛头、目的地、HBL、应收费用等。

具体步骤：(1) 新建 `consignment` 表 + 外键；(2) 把「每票才有」的字段从 `job` 下移到 `consignment`（这步最需判断：哪些归主票、哪些归分票）；(3) 用 `job.business_type` 区分作业类型（整箱自动只挂 1 票，拼箱可挂多票）；(4) 提单分层——MBL 挂主票、HBL 挂委托单；(5) 明细页加「委托单」子页签，支持新建多票。

这是**增量式**改动（加表、加外键、字段下移），不是推倒重来；已有整柜数据可平滑迁移（每条老 `job` 补一条 `consignment`）。**现在不必提前做这层**（属过度设计），只要保持 `job` 字段命名与边界干净即可。

### 12.3 整拼 vs 委拼的区别

关键区别在于：**柜子（订舱）是不是自己掌控。**

- **整拼**：自己订一整个柜，把多个委托人/分票的货拼进这一个你掌控的柜里出运，按分票报关/出单。方向是**向内汇集**（多委托人 → 一个我控制的整柜）。
- **委拼**：手上一个委托人的货装不满一个柜，把货**委托给别的代理**去拼箱出运。方向是**向外委托**（我的货 → 别人的柜，柜不在我手上）。
- **对照拼箱**：拼箱是你自己把多个委托人的货拼成一个柜出运；整拼可视为拼箱的一种，强调「一个整柜内按分票报关」；委拼方向相反，是往外委托。

---

## 13. 增量功能补充（交付后追加，不改前文确认范围）

> 本节记录主体范围交付后新增的小功能，与前文（§1~§12 的原始确认范围）解耦：前文是「最初确认要做什么」，本节是「之后又补了什么」。

### 13.1 编辑表单工具栏「动作 ▾」——模拟订舱（演示用，2026-06-10）

**工具栏三态（`JobToolbar`，新建/编辑/查看共用一条卡片，还原 Penpot）**：订舱是对「已落库的作业单」发起的动作，故按 `mode` 派生两条规则——
- **保存/放弃**：新建、编辑可点；**查看**态灰显不可点（查看时改字段需先点头部「编辑」）。
- **动作 ▾**：**查看、编辑**可点（已落库作业单均可发起订舱）；**新建**灰显不可点（作业单尚未保存、信息未填全）。

即查看态也显示这条工具栏（保存/放弃灰显占位），与编辑态布局一致，「动作」在查看/编辑下都是真实下拉。`JobToolbar` 在 `JobForm`（new/edit）与 `JobDetailClient`（view）各传一次 `mode`。

「动作」下拉 5 项：点「订舱」弹窗走一段**发送动画**——「正在向船公司发送订舱 EDI…」（转圈约 1.3s 模拟时延）→ 完成态显示「订舱指令已发送」（勾选图标 +「已向船公司发出订舱请求。」+「知道了」关闭）；其余「退舱 / 锁定作业 / 作废 / 转工作号」弹「暂不可用」轻提示（1.8s 自动消失，纯撑场面便于录演示）。

**纯演示、零副作用**：发送动画只为「大气」，完成态**只告知指令已送达，不声称订舱成功/已确认舱位**；不生成回执号、不回填表单、不接真实 EDI、不动后端、不改字段/路由。下拉与弹窗在 `app/jobs/_components/BookingAction.tsx`（无 props，自管菜单开合、发送阶段与提示计时）。

---

*确认本设计后，我再开始写代码并按第 10 节推进。*
