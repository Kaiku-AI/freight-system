# CLAUDE.md — 工程宪法 & 工作协议

> 本文件是 AI 每次开工的第一读物。读完后再读 `PROGRESS.md` 找「下一步」。
> **唯一真源**：功能/字段/逻辑以 `DESIGN.md` 为准；本文件只管「怎么做、怎么验、怎么续」。

---

## 1. 这是什么项目

海运出口订舱系统（云海简化版）。本期只做一根脊梁：**作业单（整箱 FCL）的增删改查 + 极简登录**。
范围、字段、API、页面全部见 `DESIGN.md`。不要超出 DESIGN.md 已确认的范围去「顺手多做」。

## 2. 技术栈（速查）

| 层 | 选型 |
|---|---|
| 前端 | Next.js (App Router) + TypeScript + Tailwind |
| 取数 | 原生 `fetch` + `useState`（**不用 SWR**） |
| 客户端状态 | Zustand（只管登录标记） |
| 后端 | FastAPI + SQLModel |
| 数据库 | 本地 SQLite 调试 → Supabase Postgres（连接池串，端口 6543） |
| 部署 | 单个 Vercel 项目（前端 + Python Serverless，`/api/*` 重写到 backend） |

## 3. 目录约定

```
frontend/   Next.js（app/ 一个模块一个目录；_components 私有；lib/ 放 api、modules、store；types/ 对齐后端字段）
backend/    FastAPI（index.py 入口、models.py、db.py、routers/jobs.py）
vercel.json
DESIGN.md   需求真源
CLAUDE.md   本文件
PROGRESS.md 进度与分步计划
```

## 4. 必须守住的约定（最容易写歪的地方）

- **状态边界不混用**：服务端数据走 `lib/api.ts` 的 fetch；客户端 UI 状态（登录标记）走 Zustand；列表筛选放 URL query。
- **模块清单单一数据源**：主页卡片、导航、「暂未开放」全部由 `lib/modules.ts` 派生，不在别处硬编码。
- **类型对齐**：`types/job.ts` 字段与后端 SQLModel / DESIGN.md §4 一一对应，改字段一处改。
- **job_no 规则**：`EXP+日期+流水`，如 `EXP20260608-001`，后端生成。
- **登录无鉴权**：固定账号 `test / test123`（环境变量），不发 token。退出登录纯前端清标记。
- **唯一 auth gate 在 `components/AppShell.tsx`**（客户端）：受保护页未登录跳 `/login`，已登录访问 `/login` 跳主页；登录页在 `PUBLIC_PATHS` 裸渲染、不套导航。persist 水合前用 `mounted` 门控（return null）防首帧误跳。新增「shell 外」公开页改 `PUBLIC_PATHS`，别在各页面各自写 gate。
- **不做超范围**：费用、报关、拼箱、权限一律不碰；子页签只留位不实现。
- **代码整洁优雅**：命名达意、单一职责、不留死代码与无用注释；能复用就抽小函数/小组件，但不过早抽象。每个 Phase 结束前删一遍冗余（重复逻辑、临时调试、未用 import）。宁可少写，不要堆砌。

## 5. 工作协议（每次会话都照此走）

### 开工
1. 读 `CLAUDE.md`（本文件）+ `PROGRESS.md`。
2. 在 PROGRESS.md 找「**当前状态 / 下一步**」。
3. **一次只做一个阶段**（Phase），不要一口气往下冲。

### 收尾（每完成一个 Phase 必做）
1. **写测试并跑通**——见第 6 节，没有通过的测试不算完成。
2. 更新 `PROGRESS.md`：勾选该阶段、在「变更日志」追加一行（日期 + 做了什么 + 关键决策）、写明新的「下一步」。
3. 如代码结构有新约定，回写本文件第 4 节。

### 何时提醒用户重开对话
出现以下任一情况，**主动提醒用户开新对话**（PROGRESS.md 已存住状态，新对话读两份 md 即可无缝接上）：
- 完成了一个完整 Phase，且接下来是另一主题（如后端转前端）。
- 上下文已明显变长 / 开始出现重复读文件、记不清早先决策的迹象。
- 一次调试反复试错超过 ~5 轮仍未定位。
提醒话术示例：「这个 Phase 完成且已写入 PROGRESS.md，建议开新对话做下一阶段，质量更稳。」

### 何时开 subagent
- **验收/审查**：每个 Phase 收尾，开一个 subagent 独立审查本阶段产物（对照 DESIGN.md 找漏字段、找未处理错误、找约定违背）。审查与编写分离，质量更高。
- **大范围搜索**：要在多文件/多命名里找东西时，用 Explore subagent，只取结论不污染主上下文。
- 小改动不必开，避免仪式化。

### 浏览器自测（前端 Phase 必做）
后端起在本地后，用 Claude in Chrome 打开 `localhost`：
- 走通关键路径（登录 → 列表 → 新建 → 明细 → 删除）。
- 读 console / network 看有无报错与失败请求。
- 截图核对样式与必填项标记。
看到的问题当场修，修完再截一次。

## 6. 测试要求（分层，够用即可，不过度）

- **后端**：每个接口用 `pytest` + `httpx`（或 FastAPI `TestClient`）跑一条 happy path + 一条错误路径（如必填缺失 422、删除不存在 404）。本地 SQLite 即可。
- **数据库切换**：接 Supabase 后，跑一遍 CRUD 冒烟脚本确认连接池串可用。
- **前端**：以浏览器自测为主（见 5.4）；关键纯函数（如筛选、job_no 拼装如放前端、表单校验）加轻量单测（Vitest）。浏览器自测是「当场验收」，纯函数单测才是「长期回归」，两者都要。
- **每个 Phase 的「验收标准」写在 PROGRESS.md 里**，达成才勾选。
- **测试文件长期保留（前后端都留，作回归套件）**：
  - 后端测试放 `backend/tests/`，按模块命名（如 `test_jobs.py`）。
  - 前端纯函数单测放 `frontend/__tests__/`（或与源码同目录的 `*.test.ts`），按模块命名。
  - 每个 Phase 新增的用例**只加不删**，作为以后加功能时的回归基线；老用例必须仍全绿才算完成。新做模块就新建一个对应测试文件。

## 7. 常用命令 & 环境变量

```bash
# 后端（必须用虚拟环境，依赖不污染全局）
cd backend
python3 -m venv .venv          # 首次创建（.venv 已在 .gitignore）
source .venv/bin/activate      # 每次开工先激活（Windows: .venv\Scripts\activate）
pip install -r ../requirements.txt
uvicorn index:app --reload --port 8000
pytest                         # 后端测试（在已激活的 venv 内跑）

# 前端
cd frontend && npm install && npm run dev # http://localhost:3000
```

环境变量：`DATABASE_URL`（Supabase 连接池串）、`TEST_USER`、`TEST_PASSWORD`。
**密钥只进环境变量，绝不写死进代码或提交仓库。**

---

*改了工作方式就更新本文件；改了进度就更新 PROGRESS.md。两份文件是跨会话的全部记忆。*
