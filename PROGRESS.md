# PROGRESS.md — 进度与分步计划

> 跨会话的「记忆」。开工先读这里找「下一步」，收尾回来勾选 + 记日志。
> 规则见 `CLAUDE.md`。需求真源是 `DESIGN.md`。

---

## 当前状态 / 下一步

**已完成**：脚手架 + Phase 0~2（后端 API：登录 + 作业 CRUD + job_no + 列表过滤/分页，pytest 14 绿）+ Phase 3 接 Supabase（连接池串就绪，CRUD 冒烟全绿）+ Phase 4 前端骨架（shell + 登录 + 导航 + 模块清单 + 占位页，浏览器自测全过、Vitest 3 绿、build 干净）+ Phase 5 作业列表（`types/job.ts` + `lib/api.ts` + `/jobs` 筛选/表格/分页/删除，浏览器自测全过、Vitest 7 绿、build 干净）+ Phase 6 新建/明细/编辑（`jobs/new` + `jobs/[id]` 只读+编辑，字段元数据驱动表单/明细，必填黄底红星，浏览器自测端到端全过、Vitest 12 绿、build 干净；并修了 Supabase 连接池死连接问题 `pool_pre_ping`，pytest 仍 14 绿）。
**下一步 → Phase 7：联调收尾。全链路冒烟（登录→新建→列表→明细→编辑→删除→退出）+ 边界/错误提示打磨；收尾开 subagent 对照 DESIGN.md 终审。**

---

## 分步计划（一次做一个 Phase，达成「验收」才勾选）

> 拆分原则：每个 Phase 自成一个可测试的小闭环，做完能跑、能验、能停。

- [x] **Phase 0 — 仓库初始化**
  - 目标：建 `frontend/`(Next.js+TS+Tailwind) + `backend/`(FastAPI) + `vercel.json` + `requirements.txt` 骨架；后端建 **venv**（`backend/.venv`）、建 `backend/tests/`；写 `.gitignore`（含 `.venv`、`node_modules`、`*.db`、`.env`）。
  - 验收：前端 `npm run dev` 出默认页 ✓（200，默认页）；后端在已激活 venv 内 `uvicorn` 起得来，`GET /api/health` 返回 200 ✓（`{"status":"ok"}`，pytest 一条用例绿）。

- [x] **Phase 1 — 数据模型 + 本地库**
  - 目标：`backend/models.py` 建 `job` 表（字段全照 DESIGN.md §4）；`db.py` 引擎/会话，先用本地 SQLite。
  - 验收：建表脚本跑通 ✓（起服务自动建表，`freight.db` 的 `job` 表 101 列，正好对齐 §4：基本 43+服务标志 18+托单 32+状态节点 6+审计 2）；insert 一条 select 出来 ✓（`tests/test_models.py` 绿，含默认值落库校验）。

- [x] **Phase 2 — 后端 API（CRUD + 登录 + job_no）**
  - 目标：`/api/login`、`POST/GET/GET{id}/PUT/DELETE /api/jobs`、job_no 自动生成、列表过滤+分页。
  - 验收：pytest 覆盖每个接口 happy path + 至少：必填缺失 422、查不到 404、登录错密码失败 ✓（`tests/test_jobs.py` 12 例 + 全套 14 绿）；真实 SQLite 端到端冒烟通过（login/create/list 过滤/get/put/delete）。

- [x] **Phase 3 — 接 Supabase**
  - 目标：`DATABASE_URL` 切到 Supabase 连接池串（端口 6543）。
  - 验收：对 Supabase 跑一遍 CRUD 冒烟脚本通过 ✓（`scripts/smoke_supabase.py` 全绿：建表 + 登录正/误 + 建单 201/缺必填 422 + 列表过滤 + 明细/查无 404 + 编辑 + 删除 204 + 删后 404，结束清空测试数据；14 条回归 pytest 仍全绿）。

- [x] **Phase 4 — 前端骨架（shell + 登录 + 导航）**
  - 目标：`layout.tsx`(导航+退出登录)、`login`、`store.ts`(Zustand+localStorage)、`modules.ts`、主页卡片、`unavailable` 占位页。
  - 验收：浏览器自测——登录跳主页 ✓、未登录访问受保护页跳回登录 ✓（`/`、`/jobs` 均跳）、退出登录清标记 ✓（localStorage `freight-auth` 回 loggedIn:false）、未开放卡片跳占位页 ✓、错密码红字提示 ✓、console 无报错 ✓；Vitest `__tests__/modules.test.ts` 3 绿（分组/过滤纯函数）；`npm run build` 干净。

- [x] **Phase 5 — 作业列表（查询 + 删除）**
  - 目标：`jobs/page.tsx` 筛选条 + 表格 + 新建/删除按钮（删除二次确认），`lib/api.ts` 取数。
  - 验收：浏览器自测——列表从后端加载 ✓、筛选生效（URL query，`?consignor=上海`→1 条、`?final_destination=汉堡`→1 条）✓、删除带确认（"确认删除作业 EXP…？"）并重拉（共 3→2 条）✓、console 无报错 ✓；Vitest 7 绿（新增 `__tests__/api.test.ts` 4 例：筛选拼装/空值忽略/DELETE 204/错误抛 detail）；`npm run build` 干净（`/jobs` 静态预渲染）。

- [x] **Phase 6 — 新建 / 明细 / 编辑**
  - 目标：`jobs/new`（基本信息+服务标志+托单信息，必填黄底红星）、`jobs/[id]`（只读+编辑）。
  - 验收：浏览器自测——端到端建一单成功 ✓（建 EXP20260609-003→跳 `/jobs/7`）、明细读出 ✓（节点进度+基本/服务标志/托单三块、字段格式化正确）、编辑保存 ✓（改委托人+状态，只读视图即时反映）、必填校验与错误提示生效 ✓（黄底红星 + 缺项拦截「请填写必填项：操作员、ETD…」不打后端）、明细页删除 ✓（二次确认→回列表）、console 无报错 ✓；Vitest 12 绿（新增 `__tests__/jobForm.test.ts` 5 例：初始状态默认值/编辑回填、必填校验、payload 空串转 null+数字转换）；`npm run build` 干净（`/jobs/[id]` 动态、`/jobs/new` 静态）。

- [ ] **Phase 7 — 联调收尾**
  - 目标：全链路冒烟、边界与错误提示打磨。
  - 验收：登录→新建→列表→明细→编辑→删除→退出 全程无阻塞；开 subagent 对照 DESIGN.md 做一次终审。

- [ ] **Phase 8 — 视觉还原（对 Penpot 调样式）+ 模块清单补全**
  - 前提：Phase 4~7 功能全做完、各页面都已存在（登录/主页/列表/新建/明细）。先把功能做对，最后统一调视觉，功能与视觉分开。
  - 目标 A（模块清单补全）：按 **DESIGN.md 为准**把规划中的模块补进 `lib/modules.ts`（name/group/`enabled:false`），让主页卡片 + 侧边导航铺满、未开放项点击统一跳 `/unavailable`——复用已有机制，**不碰字段/路由/业务逻辑**。模块清单最终也落到 DESIGN.md，保持前后设计一致；不够再增量加。
  - 目标 B（视觉还原）：用 Penpot MCP（`high_level_overview` → 取设计稿配色/间距/布局/组件样式）把各页面样式 + 主页分组排版贴近 Penpot 视觉稿；**只动样式（Tailwind class / 布局），不改字段、路由、交互逻辑**。冲突处仍以 DESIGN.md 为准（Penpot 仅样式参考）。
  - 验收：主页/导航列全规划模块、未开放跳 `/unavailable` ✓；登录/主页/列表/新建/明细 与 Penpot 视觉一致（配色、间距、必填黄底红星等关键样式核对）；回归——既有 Vitest 全绿、浏览器自测关键路径仍通、console 无报错。

- [ ] **Phase 9 — 部署上线**
  - 目标：Vercel（前端+Python函数）+ Supabase，环境变量配置。
  - 验收：线上网址可访问，用 test 账号走通冒烟。**（需用户提供 Vercel/Supabase 凭据）**

> 阶段切换点（建议开新对话）：Phase 2→3、Phase 3→4、Phase 6→7、Phase 7→8。

---

## 变更日志（append-only，新的写最上面）

- **2026-06-09** — 计划微调 + 小重构。① **模块清单补全并进 Phase 8**：规划中的模块（MB/L、HB/L、集装箱、进仓、报关、费用…）以 `enabled:false` 录进 `lib/modules.ts`，让主页/导航铺满、未开放跳 `/unavailable`——复用现有机制，不改字段/路由/逻辑；**清单以 DESIGN.md 为准**（前后设计一致，不够再增量加），最终落回 DESIGN.md。与视觉还原同期做（共用设计稿一次打开）。② **重命名 `JobsClient.tsx`→`JobListClient.tsx`**（函数同步改名），与 `JobDetailClient.tsx` 区分更清晰（列表 vs 明细）；改 `app/jobs/page.tsx` 引用。回归 build 干净 + Vitest 12 绿。
- **2026-06-09** — Phase 6 完成（新建/明细/编辑）。新增 `app/jobs/_components/fields.ts`（**字段元数据单一数据源**：`BASIC_FIELDS`/`CONSIGNMENT_FIELDS`/`SERVICE_FLAGS`/`NODE_FIELDS` + 选项常量 + 共享纯函数 `initialFormState`/`missingRequired`/`buildJobPayload` + `statusLabel`/`fmtDate`/`fmtDateTime`，驱动新建表单/编辑表单/只读明细三处渲染）、`app/jobs/_components/JobForm.tsx`（新建/编辑共用，必填黄底红星，提交前必填校验，新建成功跳明细、编辑成功回调刷新）、`app/jobs/_components/JobDetailClient.tsx`（只读明细：节点进度+三块字段+服务标志 chips，含编辑/删除）、`app/jobs/new/page.tsx`（服务端壳）、`app/jobs/[id]/page.tsx`（服务端壳 `await params`，非法 id→notFound）。重构 `JobsClient.tsx` 复用 fields.ts 的 `STATUS_OPTIONS/statusLabel/fmtDate`（去重）。回归：`__tests__/jobForm.test.ts` 5 例（全套 Vitest 12 绿）、pytest 14 绿、build 干净、浏览器自测端到端全过。关键决策/踩坑：① **表单字段元数据驱动**：~75 字段不手写 75 个 input，由 `FieldDef[]`（name/label/type/required/options/full）渲染，新增/改字段只动 fields.ts；纯函数（校验/payload 构建）抽到 fields.ts 与 React 解耦，便于单测。② **Next 16 动态路由 `params` 是 Promise**，`[id]/page.tsx` 须 `await params`（已读 node_modules/next/dist/docs 确认）。③ **修了 Supabase 连接池死连接 bug**：自测建单首发 500「SSL SYSCALL error: EOF detected」——pgbouncer 回收空闲连接后池里留死连接，复用即崩；`db.py` 加 `pool_pre_ping=True`（非 SQLite）取用前探活自动重连，serverless/长闲置必备。④ **datetime-local** 控件需 `YYYY-MM-DDTHH:mm`，回填时 `slice(0,16)`。⑤ 新建预填后端默认值（业务性质=整柜订舱/出运类型=整箱/状态=draft/订舱日期=今天）让用户可见可改。⑥ 自测在真库建的测试单（id 7）已用「明细页删除」路径删除清理，库恢复 2 条样例（EXP20260609-001/-002）。⑦ Claude Preview 合成事件仍不触发 React 受控 onChange/onClick——用原生 value setter + dispatch input/change、`.click()`、`requestSubmit()`、stub confirm 验证（同 Phase 5）。下一步 Phase 7（联调收尾，建议开新对话）。
- **2026-06-09** — Phase 5 完成（作业列表）。新增 `types/job.ts`（全量镜像后端 `JobBase`+系统字段，date/datetime 为 ISO 字符串，作字段唯一对齐源，Phase 6 直接复用）、`lib/api.ts`（统一 `request` helper 抛后端 detail、204 返 undefined；`getJobs`[筛选→URLSearchParams 空值忽略]/`getJob`/`createJob`/`updateJob`/`deleteJob`，全程原生 fetch 不用 SWR）、`app/jobs/page.tsx`（Suspense 包 `JobsClient`）+ `app/jobs/_components/JobsClient.tsx`（筛选条+表格+分页+删除）。回归：`__tests__/api.test.ts` 4 例（全套 Vitest 7 绿）。关键决策/踩坑：① **筛选放 URL query**（DESIGN §3.4）：表单 `name` → `onSearch` 收成 URLSearchParams → `router.push`（offset 归零）；`useSearchParams` 变化触发 `load()` 重拉；分页 `offset` 也在 URL。② Next 16 要求用 `useSearchParams` 的客户端组件包 `<Suspense>`，否则 build 报错——故 page.tsx 作服务端壳套 Suspense。③ 列「提单」DESIGN 未明确映射哪个字段（与 拖车=trucking/报关=customs_declare 并列），暂取「提单确认节点」`bl_confirmed_at` 是否完成渲染 ✓/—，Phase 6/视觉阶段可再校。④ 筛选 UI 取列对齐的常用项（作业号/委托人/船名/MBL/起运港/目的地/状态/ETD 区间）；后端另支持 voyage/booking_agent，UI 暂未放（保持筛选条简洁，需要再加）。⑤ **Claude Preview 自测踩坑**：`preview_click` 的合成点击不触发 React 受控 `onSubmit`/`onClick`，改用 `requestSubmit()`/原生 `.click()`（并 stub `window.confirm`）才验到提交与删除——处理器本身无误，纯工具限制。⑥ 浏览器自测在 Supabase 真库建了 3 条中文样例单（删 1 留 2：EXP20260609-001/-002），留给 Phase 6 明细/编辑自测用，非生产数据。下一步 Phase 6（新建/明细/编辑）。
- **2026-06-09** — 计划调整：新增 **Phase 8「视觉还原（对 Penpot 调样式）」**，原部署上线顺延为 Phase 9。决策背景：Penpot 全程定位为「样式参考」（DESIGN §0/§7.1，冲突以文档为准），原计划无专门视觉还原步骤，前端骨架先用功能型 Tailwind 样式（不刻意还原 Penpot）；与用户确认后定为「功能全做完，最后统一对 Penpot 调样式」——功能与视觉分开，视觉 Phase 只动样式不改字段/路由/交互。
- **2026-06-09** — Phase 4 完成（前端骨架）。新增 `lib/store.ts`（Zustand+persist 存登录标记，name `freight-auth`）、`lib/modules.ts`（模块清单唯一数据源 + `enabledModules`/`groupedModules` 派生）、`components/AppShell.tsx`（全局 shell：客户端 auth gate + 侧栏导航[只列 enabled] + 顶栏退出登录）、`app/login`、`app/page.tsx`（主页按 group 渲染卡片，未开放跳 `/unavailable`）、`app/unavailable`；改 `app/layout.tsx`（中文 lang/metadata，套 AppShell）、`app/globals.css`（去 dark-mode 媒体查询，统一浅色）。`next.config.ts` 加 dev rewrites：`/api/*` → `BACKEND_ORIGIN`(默认 `http://localhost:8000`)，仅 development 生效（线上走 vercel.json）。回归：Vitest 装好 + `__tests__/modules.test.ts` 3 绿（`vitest.config.ts` 配 `@/` 别名，加 `npm test` 脚本）。关键决策/踩坑：① 登录态纯客户端（Zustand+localStorage，无 token），故 auth gate 也在客户端 AppShell；persist 水合前用 `mounted` 标志门控，`mounted` 前 return null 避免 SSR 首帧闪烁与误跳转。② login 是「shell 外」——AppShell 对 `PUBLIC_PATHS=['/login']` 裸渲染、不套导航；已登录访问 /login 自动跳主页。③ 浏览器自测用 Claude Preview（Chrome 扩展未连），新增 `.claude/launch.json`（preview_start 用，`npm --prefix frontend run dev`）。④ 本机 8000 端口此次空闲，后端正常起在 8000（后端连 Supabase 启动需 ~8s）。下一步 Phase 5（作业列表）。
- **2026-06-09** — Phase 3 完成。接 Supabase：`backend/.env`（已 gitignore）写入 `DATABASE_URL`=Transaction pooler 连接池串（端口 6543，`postgresql+psycopg2://`）；`requirements.txt` 加 `psycopg2-binary`+`python-dotenv`；`db.py` 顶部 `load_dotenv()` 使本地 uvicorn/脚本能读 `.env`（线上由平台注入，无需 `.env`）。新增 `backend/scripts/smoke_supabase.py` 冒烟脚本（建表+CRUD 全链路+自清理，长期保留）。关键决策/踩坑：① 用 Transaction pooler(6543) 而非 Direct(5432)，psycopg2 同步驱动默认不开服务端 prepared statement，与 pgbouncer 事务模式兼容；② `TestClient(app)` 非 `with` 用法**不触发 lifespan**，故脚本显式调 `create_db_and_tables()` 建表；③ 建单返回 **201**、删除返回 **204**（标准 REST，先前 Phase 2 已如此，勿误期望 200）。回归 pytest 仍 14 绿。下一步 Phase 4（前端，建议开新对话）。
- **2026-06-09** — Phase 2 完成。`models.py` 重构为 SQLModel 五件套（`JobBase` 业务字段真源 → `Job` 表 + `JobCreate`/`JobRead`/`JobList`/`LoginRequest`）。`routers/jobs.py`：5 个 CRUD 接口（POST 建单自动生成 job_no、GET 列表支持 §5 全部筛选[文本 ilike 模糊/status 精确/etd 区间]+limit/offset 分页+total、GET{id}/PUT[整单覆盖业务字段保号刷 updated_at]/DELETE，缺失 422/查无 404）。`index.py` 挂 router + `/api/login`（环境变量 `TEST_USER/TEST_PASSWORD` 默认 test/test123，错密码 401）。`job_no` 规则 `EXP+YYYYMMDD+-三位流水`，按当天最大序号递增。回归 `tests/test_jobs.py` 12 例（全套 14 绿）。备注：job_no 生成在高并发下有竞态但有 unique 兜底，本期单机够用；本地与前端跨域留 Phase 4 用 Next rewrite 代理解决。下一步 Phase 3。
- **2026-06-09** — Phase 1 完成。`models.py` 建 `Job` 表（101 字段，分基本/服务标志/托单/状态节点/审计五块，逐一对照 DESIGN §4；必填字段非 Optional，`business_type`/`shipment_type`/`status`/`booking_date` 给默认，重量体积用 float，审计 `created_at/updated_at` default_factory）；`db.py` 按 `DATABASE_URL` 选引擎（默认 `sqlite:///./freight.db`，SQLite 放开线程检查），`get_session` 依赖 + `create_db_and_tables`；`index.py` lifespan 启动建表。回归测试 `tests/test_models.py`（独立内存 SQLite，insert+select+默认值校验）。下一步 Phase 2。
- **2026-06-09** — Phase 0 完成。前端 `create-next-app`（Next 16 + TS + Tailwind + App Router，无 src 目录）；后端 FastAPI 骨架 `backend/index.py`（`GET /api/health`），建 `.venv` 并装 fastapi/uvicorn/sqlmodel/httpx/pytest；测试 `backend/tests/test_health.py` 绿（`backend/pytest.ini` 设 `pythonpath=.` 使可 import index）；补 `vercel.json` 骨架（builds+routes，待 Phase 8 实测）。**注意：本机 8000 端口被 Docker 占用，本地起后端请用 8001 或先停 Docker。** 下一步 Phase 1。
- **2026-06-09** — 补充三条约定：后端用 venv、测试文件长期保留为回归套件（`backend/tests/`）、全项目代码整洁不冗余。
- **2026-06-09** — 建立工作流脚手架：CLAUDE.md（约定+协议）、PROGRESS.md（分步计划）。下一步 Phase 0。
