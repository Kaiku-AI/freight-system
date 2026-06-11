# UI.md — 界面设计语言（对齐云海）

> 本文件记录前端的视觉与布局约定，参照「云海」货代系统截图还原。
> **唯一真源**：功能/字段以 `DESIGN.md` 为准；配色令牌以 `frontend/app/globals.css` 的 `@theme` 为准；本文件只描述「界面长什么样、为什么这样」。
> 改样式 = 改令牌或对应组件类，**不碰字段/路由/业务逻辑**（守住 `AGENTS.md` §4 边界）。

---

## 1. 设计基调

企业级、密排、信息密度高的「软件工作台」观感（云海风格），而非现代营销式大圆角卡片：

- **顶部蓝色软件栏（云朵 logo）+ 其下橙色页签条**（模块=深色激活块，右侧灰字当前页名）。
- **左侧常驻图标导航**（云海 17 个模块平铺，无分组），蓝色激活态（左侧 3px 主色竖条 + 浅蓝底）。
- **模块页为「窗体」**：蓝色标题栏（如 整箱/海运出口）+ 顶级工具栏 + 主页签 + 次级工具栏 + 内容区。
- **表单分块为淡蓝实底面板**：块内粗体标题（无标题条），字段「标签左、输入右」密排，必填项米黄底。
- **方角、细描边、浅分隔**：弃用大圆角阴影卡片（`rounded-2xl`/`shadow`），统一 `border border-line` 平面板 + `rounded`(4px) 控件；工具栏按钮为无边框扁平文字。

---

## 2. 颜色令牌（单一数据源：`globals.css` `@theme`）

Tailwind v4 命名色 → 自动生成 `bg-*/text-*/border-*` 工具类。**全站只用这套语义色，不裸用默认色阶。**

| 令牌 | 值 | 用途 |
|---|---|---|
| `brand` | `#29b6f6` | 主色：按钮/链接/激活态/竖条（云海蓝） |
| `brand-dark` | `#14a3e8` | 主色 hover |
| `brand-soft` | `#e6f6fe` | 主色浅底：激活导航/服务标志 chip |
| `topbar` / `topbar-dark` | `#2aa3e8` / `#1f86c9` | 顶栏蓝色渐变（`bg-gradient-to-r`） |
| `accent` | `#ff8c1a` | 强调橙：激活页签下划线 / 主页操作类链接（云海橙） |
| `accent-soft` | `#fff2e3` | 橙浅底 |
| `ink` | `#161823` | 标题文本 |
| `body` | `#3d4150` | 正文文本 |
| `muted` | `#8a91a6` | 次要文本 / 字段标签 |
| `faint` | `#aab0c2` | 占位 / 分组小标 |
| `line` | `#e3e8f1` | 描边 / 分隔线 |
| `line-strong` | `#c2c7d6` | 强描边（次按钮边） |
| `canvas` | `#f4f6fb` | 页面底色 |
| `panel` | `#d5e6f8` | 表单分块淡蓝实底（云海表单面板） |
| `panel-line` | `#b9d4ee` | 面板内输入描边 / 页签描边 / 面板内分隔线 |
| `field` | `#f2f4f9` | 只读/禁用输入底 |
| `required` / `required-line` | `#fdf3e3` / `#ecd9b5` | 必填/重点项米黄底 + 米黄描边（云海） |
| `star` | `#f04a6e` | 必填红星 / 危险（删除） |

> 出运状态胶囊配色集中在 `app/jobs/_components/fields.ts` 的 `statusBadgeClass`（草稿/出运中/已关闭）。

---

## 3. 布局骨架（`components/AppShell.tsx`）

```
┌──────────────────────────────────────────────────────────┐
│ 蓝色软件栏（蓝渐变 topbar→topbar-dark, h-12）               │
│  ☁ 国际货运代理                          test │ 退出登录   │
├──────────────────────────────────────────────────────────┤
│ 橙色页签条 h-9：▌模块▐ 工作台 最近打开 │ ≡ <当前页名>(灰)   │
├──────────┬───────────────────────────────────────────────┤
│ 侧栏 w-56 │ 主内容 main（p-5）                              │
│ 我的工作台│                                               │
│ 海运出口▪ │                                               │
│ 海运进口  │                                               │
│ …（17 项）│                                               │
│ ─用户区── │                                               │
└──────────┴───────────────────────────────────────────────┘
```

- **橙色页签条 `TOP_TABS`**：`模块 / 工作台 / 最近打开`，整条 `bg-accent`。仅「模块」真实（链 `/`，是任意子页回模块导航主页的入口），激活态 = 深色块 `bg-ink` 白字；其余装饰跳 `/unavailable`。页签右侧灰字显示当前页名（`crumbLabel(pathname)`，还原云海「≡ 业务统计」位）。
- **侧栏 `SIDEBAR_ITEMS`**（`lib/modules.ts`）：云海 17 个模块**平铺无分组**（我的工作台/海运出口/海运进口/空运出口/空运进口/陆运操作/铁路运输/本地业务/业务操作/仓库管理/集装箱管理/PO管理/运价管理/财务管理/客户管理/基础数据/系统设置）；仅「海运出口」→ 真实主页 `/`，其余 → `/unavailable`。海运出口在 `/` 与 `/jobs*` 高亮（左 3px 主色竖条 + `bg-brand-soft` + `text-brand`）。图标按 `item.key` 由 `components/NavIcons.tsx` 渲染线性 SVG（勿用 emoji）。
- 用户区固定侧栏底部（头像首字母 + 用户名 + 「操作员」）。

---

## 4. 关键组件样式

### 4.1 模块导航主页（`app/page.tsx`）
- 平面白板（`border border-line`），右上装饰 ×（还原云海面板，不可点）。
- 按 `groupedModules()` 分组：**组名统一主色蓝粗体**（云海样式，无彩色组名/无下边线），组下功能链接 `flex flex-wrap` 流式密排。
- **已开放项（`enabled`）= 橙色 `text-accent` + hover 下划线**（呼应云海高亮的操作链接）；未开放项 `text-body`，点击跳 `/unavailable`。

### 4.2 作业窗体（`JobWindow.tsx`，新建/编辑/明细共用）
还原云海整箱作业窗：
```
蓝色标题栏 WindowTitleBar「整箱/海运出口」＋右侧小字（作业号+状态 / 新建作业单）
顶级工具栏：新建(真)│复制│删除(明细真)│航线确认…│船东确认·放箱确认·开船确认(灰)│…│上行 下行│关闭(真)
主页签：▌作业▐ 装箱 费用 凭证 代理对账单 附件 物流可视化（仅「作业」为当前内容）
次级工具栏（toolbar 槽，JobToolbar）：保存/放弃 或 编辑 │ 订舱模板▾ 费用确认▾ … 系统功能▾
内容区 p-3 space-y-2.5（蓝面板堆叠）
```
- 真实按钮：新建 → `/jobs/new`；删除（明细传 `onDelete`）；关闭（`onClose`＝放弃/返回列表）；其余 `ToolbarGhost`。
- 两级工具栏均保持单行横向排列（必要时 `overflow-x-auto`），避免窄宽度下换行打乱云海菜单顺序；次级工具栏使用浅橙底 `accent-soft`。
- 列表页只复用 `WindowTitleBar`（「作业列表/海运出口」+ 共 N 票）。

### 4.3 表单分块（`JobForm.tsx` 的 `Panel`、`JobDetailClient.tsx` 的 `SectionShell`）
共用同一观感（云海淡蓝实底块，无标题条）：
```
<section class="bg-panel p-3">
  <h2 class="mb-2.5 text-sm font-bold text-ink">标题</h2>
  …字段网格…
</section>
```
- **基本信息与服务标志同处一块面板**：字段网格下接 `border-t border-panel-line/70` 分隔的勾选网格（云海大面板结构）；作业确认状态仍为独立面板（用户既定布局）。
- **字段网格**：`grid sm:2 / lg:3 / xl:4` 列；`full` 字段 `col-span-full`。
- **单字段（`FieldInput` / 只读 `FieldGrid`）**：标签左对齐 `w-20 shrink-0 text-xs text-body`，输入/值在右 `flex-1`。
- **必填项**：标签后红星 `text-star *`；输入框 `bg-required border-required-line`（米黄底，云海）。
- 控件统一 `rounded`(4px) + `px-2.5 py-1` 密排，普通输入 `border-panel-line bg-white`，聚焦 `focus:border-brand`。
- **勾选项网格（确认状态 / 服务标志）**：`grid sm:3 / lg:6`；勾选框用全局 `.check-brand`（白底 → 选中天蓝底白对勾，见 `globals.css`）。

### 4.4 子页签（`JobTabs.tsx`）
- 整箱作业 9 个页签（`JOB_TABS`，对齐云海：托单信息/其它信息/船东舱单/货物/PO Item/集装箱/目的港服务/MB/L/HB/L），仅「托单信息」真实，其余在本卡片内显示 `TabPlaceholder`「暂未开放」（**不跳走、不丢表单**）。
- 受控组件，**盒式页签**：激活 `rounded-t border-panel-line border-b-panel bg-panel font-semibold`（与下方蓝面板连成一体）；页签条 `border-b border-panel-line`。
- 未开放占位 icon 用白底 + 灰色细描边，不用浅蓝实底，避免在蓝色面板中显得突兀。

### 4.5 工具栏（`JobToolbar.tsx` / `Toolbar.tsx`）
- **扁平文字按钮**（云海排面）：共用 `toolbarBtnCls`（无边框、`px-2 py-1 text-[13px]`），竖线 `ToolbarDivider` 分组。
- 真实按钮：保存（`bg-brand` 小实心）/ 放弃（描边）；view 态以实心「编辑」打头（进编辑态）；三态见 `JobToolbar` 注释（new/edit/view）。
- 装饰按钮 `ToolbarGhost`：`disabled` 不可点但深色文字（云海观感）；`muted` 变体灰字（云海里灰显的确认类按钮）。

### 4.6 列表（`JobListClient.tsx`）
- 整页一个窗体：`WindowTitleBar`「作业列表/海运出口」→ 扁平工具栏（新建整箱真实 + 装饰）→ 淡蓝筛选面板（`bg-panel` + 块内粗体标题）→ 平面表格 → 分页。
- 行 hover `bg-canvas`；作业号 `text-brand` 链接；出运状态胶囊 `statusBadgeClass`；布尔列用 `.check-brand` 只读勾选。

### 4.7 登录（`app/login/page.tsx`）
- 云海居中白底布局：左品牌块（云朵 logo + 品牌名主色大字 + 标语 + 橙字「测试库」）+ 右表单（标签左输入右四行：分支机构代码/用户代码/密码/部门）。
- 标语不出现 AI 字样；分支机构代码不预填 `YH`。仅用户代码、密码真实参与登录；分支机构代码、部门、模拟登录、右上二维码为装饰（`disabled`，还原云海排面）。密码框浅蓝底 `bg-brand-soft` + 眼睛切换。

### 4.8 订舱动作弹窗（`BookingAction.tsx`）
- 发送完成态使用云海式方角系统窗：蓝色标题栏、白底内容、4px 圆角、细描边；不要回到现代大圆角大留白弹窗。
- 文案只表达「订舱指令已发送 / 已向船公司发出订舱请求」，不声称真实订舱成功、不回填业务字段。

---

## 5. 改样式的落点（速查）

| 想改的东西 | 改哪 |
|---|---|
| 全站配色 | `app/globals.css` `@theme` |
| 顶栏 / 页签条 / 侧栏结构 | `components/AppShell.tsx`（+ `lib/modules.ts` 的 `SIDEBAR_ITEMS`） |
| 侧栏图标 | `components/NavIcons.tsx` |
| 主页分组 / 链接 | `lib/modules.ts`（`GRID`）+ `app/page.tsx` |
| 作业窗体（标题栏/顶级工具栏/主页签） | `app/jobs/_components/JobWindow.tsx`（基础件在 `Toolbar.tsx`） |
| 表单分块 / 字段样式 | `JobForm.tsx`（`Panel`/`FieldInput`）、`JobDetailClient.tsx`（`SectionShell`/`FieldGrid`） |
| 出运状态胶囊色 | `app/jobs/_components/fields.ts` `statusBadgeClass` |
| 勾选框外观 | `app/globals.css` `.check-brand` |

> 新增字段仍由 `fields.ts` 的 `FieldDef[]` 驱动（单一数据源），样式自动套用；不手写逐个 input。
