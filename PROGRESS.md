# PROGRESS.md — 进度与分步计划

> 跨会话的「记忆」。开工先读这里找「下一步」，收尾回来勾选 + 记日志。
> 规则见 `CLAUDE.md`。需求真源是 `DESIGN.md`。

---

## 当前状态 / 下一步

**已完成**：工作流脚手架（CLAUDE.md + 本文件）。
**下一步 → Phase 0：仓库初始化。**

---

## 分步计划（一次做一个 Phase，达成「验收」才勾选）

> 拆分原则：每个 Phase 自成一个可测试的小闭环，做完能跑、能验、能停。

- [ ] **Phase 0 — 仓库初始化**
  - 目标：建 `frontend/`(Next.js+TS+Tailwind) + `backend/`(FastAPI) + `vercel.json` + `requirements.txt` 骨架；后端建 **venv**（`backend/.venv`）、建 `backend/tests/`；写 `.gitignore`（含 `.venv`、`node_modules`、`*.db`、`.env`）。
  - 验收：前端 `npm run dev` 出默认页；后端在已激活 venv 内 `uvicorn` 起得来，`GET /api/health` 返回 200。

- [ ] **Phase 1 — 数据模型 + 本地库**
  - 目标：`backend/models.py` 建 `job` 表（字段全照 DESIGN.md §4）；`db.py` 引擎/会话，先用本地 SQLite。
  - 验收：建表脚本跑通；能 insert 一条、select 出来（pytest 一条用例）。

- [ ] **Phase 2 — 后端 API（CRUD + 登录 + job_no）**
  - 目标：`/api/login`、`POST/GET/GET{id}/PUT/DELETE /api/jobs`、job_no 自动生成、列表过滤+分页。
  - 验收：pytest 覆盖每个接口 happy path + 至少：必填缺失 422、查不到 404、登录错密码失败。

- [ ] **Phase 3 — 接 Supabase**
  - 目标：`DATABASE_URL` 切到 Supabase 连接池串（端口 6543）。
  - 验收：对 Supabase 跑一遍 CRUD 冒烟脚本通过。**（需用户提供连接串）**

- [ ] **Phase 4 — 前端骨架（shell + 登录 + 导航）**
  - 目标：`layout.tsx`(导航+退出登录)、`login`、`store.ts`(Zustand+localStorage)、`modules.ts`、主页卡片、`unavailable` 占位页。
  - 验收：浏览器自测——登录跳主页、未登录访问受保护页跳回登录、退出登录清标记、未开放卡片跳占位页。

- [ ] **Phase 5 — 作业列表（查询 + 删除）**
  - 目标：`jobs/page.tsx` 筛选条 + 表格 + 新建/删除按钮（删除二次确认），`lib/api.ts` 取数。
  - 验收：浏览器自测——列表从后端加载、筛选生效（URL query）、删除带确认并重拉。console 无报错。

- [ ] **Phase 6 — 新建 / 明细 / 编辑**
  - 目标：`jobs/new`（基本信息+服务标志+托单信息，必填黄底红星）、`jobs/[id]`（只读+编辑）。
  - 验收：浏览器自测——端到端建一单成功、明细读出、编辑保存、必填校验与错误提示生效。

- [ ] **Phase 7 — 联调收尾**
  - 目标：全链路冒烟、边界与错误提示打磨。
  - 验收：登录→新建→列表→明细→编辑→删除→退出 全程无阻塞；开 subagent 对照 DESIGN.md 做一次终审。

- [ ] **Phase 8 — 部署上线**
  - 目标：Vercel（前端+Python函数）+ Supabase，环境变量配置。
  - 验收：线上网址可访问，用 test 账号走通冒烟。**（需用户提供 Vercel/Supabase 凭据）**

> 阶段切换点（建议开新对话）：Phase 2→3、Phase 3→4、Phase 6→7。

---

## 变更日志（append-only，新的写最上面）

- **2026-06-09** — 补充三条约定：后端用 venv、测试文件长期保留为回归套件（`backend/tests/`）、全项目代码整洁不冗余。
- **2026-06-09** — 建立工作流脚手架：CLAUDE.md（约定+协议）、PROGRESS.md（分步计划）。下一步 Phase 0。
