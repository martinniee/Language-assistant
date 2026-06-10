# Language Assistant requirement baseline

本文档是项目的功能需求基线。每次修改项目，尤其是新增、删除、调整功能或改变数据结构、交互流程、存储格式时，都必须同步更新本文档。

## 维护规则

- 功能改动必须同步更新本文档，保持“代码行为”和“需求描述”一致。
- 不重复实现已有功能；新增功能前先检查本文档中的现有能力和兼容约束。
- 涉及数据格式、Markdown 存储、设置项、导入导出、SRS 元数据的改动，必须记录兼容策略。
- UI 改动如果改变用户工作流、入口、按钮语义或页面结构，也必须记录。
- 历史说明、报告、阶段总结放在 `docs/`；根目录只保留运行、构建和入口说明所需文件。

## 产品定位

Language Assistant 是一个 Obsidian 单词管理插件，用于在 Obsidian 内维护个人词库、复习计划、词汇元数据和学习统计。

插件应保持以下方向：

- 面向真实学习工作流，而不是示例项目或练习 UI。
- 使用 Markdown 文件作为可读、可迁移、可版本管理的数据源。
- UI 应贴合 Obsidian 的主题系统、可访问性和插件体验。
- 功能优先保证数据安全、可回退、可兼容。

## 当前项目结构要求

根目录保留必要运行和构建文件：

- `src/`：插件源码
- `src/components/`：可复用 React 展示组件，按业务域继续分目录，例如 `components/word-manager/`
- `docs/`：说明性文档、需求基线、历史记录和开发记录
- `manifest.json`：Obsidian 插件清单
- `main.js`：打包后的插件入口
- `styles.css`：插件样式
- `words.md`：默认词库数据文件
- `data.json`：Obsidian 插件本地设置
- `package.json` / `package-lock.json`：依赖和构建脚本
- `tsconfig.json` / `tsconfig.app.json`：TypeScript 配置

说明性文档统一放在 `docs/` 下。

## 代码组织要求

- 不应继续把页面状态、业务流程、展示组件、工具函数全部堆叠在单个 TSX 文件中。
- 页面级组件负责状态编排、数据流和业务动作；纯展示组件放在 `src/components/<domain>/`。
- 可复用工具函数放在 `src/utils/`，不直接持有 React 状态。
- 类型定义优先放在 `src/types/` 或靠近所属模块的小型 interface 中，避免跨文件复制类型。
- 新增模块应通过目录 `index.ts` 暴露稳定出口，便于后续继续拆分和迁移。
- 拆分必须保持外部 props、存储格式、Obsidian view id、命令和设置字段兼容。

## 当前已实现功能

### 插件入口

- 注册 `word-manager-view` 作为单词管理视图。
- 提供命令打开单词管理页。
- 提供侧边栏 ribbon 图标打开单词管理页；若单词管理页已打开，应激活并刷新已有 tab，不应重复创建新 tab。
- 提供插件设置页，用于配置词库文件路径。

### 单词管理

- 支持新增单词。
- 支持编辑单词。
- 支持删除单词，并有确认提示。
- 支持查看单词详情。
- 单词详情页支持受限富文本展示：备注、定义、例句可渲染基础 Markdown 字体样式和白名单颜色标签。
- 单词详情页的备注、定义、例句必须支持 Obsidian wiki 链接解析渲染，例如 `[[gangs]]`、`[[English-vobs-db#battle|battle]]`，并保持与 Obsidian 默认内部链接一致的跳转行为；目标文件或标题不存在时保持 Obsidian 默认行为。
- 支持从 UI 跳转到 Markdown 源文件中对应单词位置。
- 支持搜索单词、分类、标签等内容。
- 支持可选全文高亮。
- 支持按列表或网格模式展示单词。
- 支持分页浏览。
- 支持按时间排序查看单词，依据 `itemMeta.lastUpdate`，缺失时用 `itemMeta.createAt` 兜底。
- 支持按最近添加排序查看单词，依据 `itemMeta.createAt`，缺失时用 `itemMeta.lastUpdate` 兜底。
- 支持按标签、分类、等级、词性筛选。
- 支持清除筛选条件。
- 单词管理页支持随机单词轻量练习工具：用户可配置抽取数量，从当前词库无放回随机挑选指定数量的单词，逐项显示/隐藏释义并做本轮“认识/模糊”判断；该功能仅用于增加曝光率，不写回查询次数、SRS 元数据、`itemMeta` 或 Markdown 存储文件。

### 单词数据字段

当前单词模型包含：

- `name`：单词名称
- `pronunciation`：发音
- `vocabulary`：词汇字段
- `partsOfSpeech`：词性概览
- `notes`：备注
- `content`：词性、定义、例句的层级内容
- `itemMeta`：项目级元数据
- `srsMeta`：间隔复习元数据

兼容字段：

- `metadata`
- `category`
- `tags`
- `level`

### 词性、定义、例句

- 一个单词可包含多个词性。
- 一个词性可包含多个定义。
- 一个定义可包含多个例句。
- 新增/编辑表单支持添加和删除词性、定义、例句。
- 删除词性、定义、例句时需要确认。

### 元数据管理

- 支持分类、标签、等级、词性概览。
- 支持全局元数据配置。
- 支持通过全局元数据生成或解析别名。
- 支持批量更新单词元数据。

### Markdown 存储

- 默认词库文件为 `words.md`。
- 支持用户自定义词库 Markdown 文件路径。
- 路径必须以 `.md` 结尾。
- 词库文件不存在时会自动创建。
- 父文件夹不存在时会自动创建。
- 支持读取、解析、保存 Markdown 词库。
- 支持新格式数据区块：
    - `%%data-start%%`
    - `%%global-meta...%%`
    - `%%item-meta{...}%%`
    - `%%srs-meta{...}%%`
    - `%%data-end%%`
- 仍需兼容旧格式字段。
- 加载时会检测重复单词，并保留最后出现的版本。
- 新写入的时间戳统一使用本地时间 `YYYYMMDDHHmm` 格式，例如 `202606081430`。
- 读取时必须兼容旧 ISO 8601 时间戳，例如 `2026-03-14T04:35:19.472Z`，并兼容 `YYYYMMDDHHmm` 与 `YYYY-MM-DD HH:mm`。
- 编辑单词内容并保存时必须刷新 `itemMeta.lastUpdate`；仅因搜索后查看详情触发的静默查询次数更新不得刷新 `lastUpdate`。
- Markdown 文档中的备注、定义、例句允许写入基础 Markdown 字体样式，并在 app 页面做受限渲染；存储时仍按原始文本保存，不改变 Markdown 存储格式。
- App 页面富文本渲染当前支持 `*斜体*`、`**粗体**`、`***粗斜体***`，以及 `<span style="color:red|blue|green">文本</span>`、`<font color="red|blue|green">文本</font>` 这类白名单颜色标签。
- 单词详情页应使用 Obsidian 原生 Markdown 渲染能力解析备注、定义、例句中的 wiki 链接；示例：`*The police was killed in the crossfire with criminal [[gangs]].* [[English-vobs-db#battle|battle]]` 应渲染斜体文本，并将 `[[gangs]]` 与 `[[English-vobs-db#battle|battle]]` 渲染为可点击的 Obsidian 内部链接。
- 富文本渲染不得直接执行任意 HTML；除红、蓝、绿及其基础 hex 等价写法外，其它标签、属性和颜色应保持为普通文本或不做富文本处理。

### 间隔重复学习

- 支持 SRS 元数据：
    - `srsLevel`
    - `nextReviewDate`
    - `lastReviewDate`
    - `reviewCount`
    - `correctCount`
    - `ease`
    - `interval`
- 主导航显示今日待学数量。
- 支持进入间隔学习页面。
- SRS 的 `nextReviewDate` 与 `lastReviewDate` 新写入时使用 `YYYYMMDDHHmm`，比较与排序时通过统一时间解析工具还原为 `Date`。
- 复习答案页中的定义和例句应与详情页保持一致，支持相同的受限富文本渲染。

### 数据统计

- 支持统计页面。
- 主导航显示总单词数和今日待学数量。

### 导入导出

- 支持进入导入导出页面。
- 当前导入导出逻辑应保持与 `Word` 数据结构兼容。

### 设置

- 支持配置词库文件路径。
- 支持路径输入建议。
- 支持检查当前词库文件是否存在。
- 支持重置为默认词库路径 `words.md`。
- 修改路径后应更新已打开的单词管理视图。

## UI 需求基线

### 总体要求

- UI 应现代化、产品化、贴合 Obsidian 插件风格。
- 当前视觉方向为浅色优先：保留 Apple/iOS inspired 的清晰排版、开放留白和自然动效，并试应用 Soft UI / Neumorphism 的柔和浅灰 surface、外凸卡片、内凹输入和按压反馈。
- Soft UI 色彩、圆角、阴影和动效必须集中在 `--la-*` token 与共享 `la-*` 类中，避免在页面组件里分散硬编码。
- 暗色主题不追求完全复刻浅色视觉，但必须保证文字、边框、输入框、按钮、弹窗可读可操作。
- 页面用户可见文案必须保持正常中文或明确的英文，不允许出现编码乱码。
- 新增或修改文案后，应检查搜索框、按钮、筛选器、弹窗、详情页、错误提示等主要入口是否存在乱码。
- 样式应尽量集中在 `styles.css`。
- 优先使用 Obsidian CSS 变量，例如：
    - `--background-primary`
    - `--background-secondary`
    - `--text-normal`
    - `--text-muted`
    - `--interactive-accent`
    - `--background-modifier-border`
- 避免页面组件分散硬编码色彩、过度渐变、强制亮色主题和 `!important`；必要的视觉基线色值应集中在 `styles.css` 的设计 token 中。
- 交互控件需要可键盘访问。
- 图标按钮需要 `aria-label` 或等价可访问名称。
- 触控目标应尽量不小于 44px。
- 动效应使用轻量 CSS transition/animation，并尊重 `prefers-reduced-motion`。
- 插件各页面底部必须保留安全留白，避免 Obsidian 状态栏、底部浮层或系统安全区域遮挡最后一段内容。
- UI 重构不得改变 `Word` 数据结构、Markdown 存储格式、Obsidian view id、插件命令或设置字段。
- 插件页面中的图标统一使用成熟图标库 `lucide-react`；不得用 emoji 充当页面图标、标题图标、状态图标或按钮图标。
- 非 React 的 Obsidian 设置面板和命令面板文案不得混用 emoji 前缀，保持纯文本或使用 Obsidian/lucide 体系可维护图标。

### 当前 UI 重构状态

已完成：

- 主应用外壳重构为 `la-app-shell`、`la-sidebar`、`la-main`、`la-page-header`。
- 主导航使用 Obsidian 主题变量和可访问按钮。
- 已建立 `--la-*` 设计 token，覆盖字体、浅色优先 surface、圆角、阴影、状态色、渐变和动效。
- 已将 Soft UI / Neumorphism UX 试应用到浅色基线：`styles.css` 使用 `#e0e5ec` 系浅灰底、`#3d4852` 正文、`#6c63ff` 主强调色、`#38b2ac` 成功色、32px 级卡片圆角、外凸/内凹阴影和按钮按压反馈。
- 已建立 `.la-page`、`.la-button`、`.la-icon-button`、`.la-input`、`.la-select`、`.la-chip`、`.la-card`、`.la-panel`、`.la-segmented`、`.la-modal`、`.la-field` 等共享 UI 类。
- 单词管理、复习、统计、导入导出、全局元数据、设置页已接入页面级 class，进入统一视觉系统。
- 主要 TSX 页面中常见硬编码 iOS 色值、圆角、阴影已替换为 `--la-*` token 或 Obsidian 主题变量。
- 单词卡片 `WordCard` 已改为 class-based 产品化结构。
- 单词列表行 `WordListItem` 已改为 class-based 产品化结构。
- 单词结果区和空状态已接入统一样式。
- 单词详情页应弱化顶部操作按钮和基础元信息的视觉权重，使用低对比灰色与轻阴影；定义、例句等正文内容应作为页面主体，通过更清晰的卡片、标题、行距和对比度突出。
- 单词管理页的结果展示组件已拆分到 `src/components/word-manager/`，单词管理通用工具已拆分到 `src/utils/wordManager.ts`。
- 统计页、间隔复习页、全局元数据页已将页面标题、状态、建议、统计卡片等 emoji 图标替换为 `lucide-react` 图标；统计页“待学习”“新单词”卡片不得再使用文本/emoji 图标，统计概览卡片图标应使用统一图标容器和语义化图标，不裸露显示简陋线性图标。
- Obsidian 设置页和命令面板中的 emoji 文案前缀已移除，避免与页面图标体系混用。

仍需继续：

- 继续将新增/编辑弹窗、筛选面板、详情页内部结构逐步拆分为更细的 class-based 子组件。
- 继续将单词管理页的筛选、详情、表单拆成独立模块，降低 `WordManagerMarkdownNew.tsx` 的体积。
- 继续减少历史内联样式和生产路径中的调试日志。
- 继续做 Obsidian 浅色/暗色主题和窄宽度面板的人工视觉验收。

## 兼容开发约束

- 不得破坏已有 `words.md` 数据。
- 修改 Markdown 序列化格式时必须提供旧格式读取兼容。
- 修改 `Word` 类型时必须同步检查：
    - `MarkdownWordStorage.ts`
    - `WordManagerMarkdownNew.tsx`
    - `SpacedRepetitionLearning.tsx`
    - `DataStatistics.tsx`
    - `ImportExport.tsx`
    - `GlobalMetaConfig.tsx`
- 修改存储路径设置时必须考虑已打开视图的刷新。
- 删除功能必须保留确认提示，避免误删词库数据。
- 批量更新功能必须保持数据保存的一致性。
- 任何涉及 Obsidian API 的改动应遵循 `.agents/skills/obsidian/SKILL.md`。
- 插件自定义样式和 DOM 类名必须使用 `la-*` 命名空间，避免覆盖 Obsidian 核心类名，例如链接建议弹窗 `.suggestion-container`。
- 全局键盘监听不得影响 Obsidian 编辑器输入；快捷键逻辑必须限定在插件视图或插件控件内部。

## 验证要求

功能或源码改动后至少运行：

```bash
npx tsc --noEmit -p tsconfig.app.json
npm run build-app
```

仅文档改动可不运行构建，但最终说明中必须明确“仅文档改动，未运行构建”。

测试资产：

- `docs/word-crud-functional-test-cases.xls`：单词基础增删改查功能测试用例，覆盖新增、查询/查看、编辑、删除、基础回归和数据一致性检查。

## 后续开发优先级

1. 细化新增/编辑弹窗内部表单的 class-based 结构。
2. 细化筛选面板和详情页内部布局。
3. 做浅色、暗色、窄宽度 Obsidian 面板的视觉回归。
4. 减少生产路径中的调试 `console.log`。
5. 梳理 Obsidian API 使用，逐步贴合插件发布规范。

## 变更记录

### 2026-06-07

- 建立需求基线文档。
- 记录当前已实现功能、UI 重构状态、兼容开发约束和后续优先级。
- 修复单词管理页用户可见乱码文案，覆盖搜索、按钮、筛选、排序、表头、分页、详情页和新增/编辑弹窗主要字段。

### 2026-06-08

- 实施浅色优先 Apple/iOS 风格全插件 UI 重构基线。
- 在 `styles.css` 中建立统一 `--la-*` 设计 token、共享组件类、暗色兜底和 `prefers-reduced-motion` 动效降级。
- 为单词管理、复习、统计、导入导出、全局元数据、设置页接入页面级 class。
- 将主要页面中常见硬编码色值、圆角、阴影替换为设计 token，不改变数据结构、存储格式或业务流程。
- 修复单词详情页基础信息区和新增/编辑弹窗中“发音”字段残留乱码。
- 建立代码组织规范，开始将单词管理页拆分为页面容器、展示组件和工具函数。
- 统一页面图标体系：React 页面采用 `lucide-react` 图标，移除统计、复习、元数据、设置页和命令面板中的 emoji 图标入口。
- 统一时间戳存储格式：新增 `src/utils/date.ts`，新写入的单词元数据、SRS 元数据、全局元数据更新时间使用 `YYYYMMDDHHmm`；旧 ISO 时间戳保持读取兼容，并在后续保存时规范化。
- 优化数据统计页概览卡片图标：使用 `LibraryBig`、`AlarmClock`、`BadgeCheck`、`BookPlus` 等语义化 `lucide-react` 图标，并通过 `.la-stat-icon` 建立统一的 iOS 风格图标容器。
- 修复编辑单词时 `itemMeta.lastUpdate` 不更新的问题：非静默编辑保存时刷新为当前 `YYYYMMDDHHmm`，静默查询计数更新保持原更新时间。
- 新增单词 CRUD 功能测试用例 Excel 文件 `docs/word-crud-functional-test-cases.xls`，覆盖新增、查询/查看、编辑、删除、基础回归和数据一致性检查。
- 修复插件启用后 Obsidian `[[ ]]` 链接建议不弹出的问题：设置页路径建议类名改为 `la-path-*`，避免覆盖 Obsidian 核心 `.suggestion-container`；单词管理快捷键监听限制在插件视图内部。
- 修复重复点击左侧 ribbon 图标会创建多个单词管理 tab 的问题：打开入口优先复用已有 `word-manager-view`，并刷新已打开视图中的词库数据。
- 试应用 Soft UI / Neumorphism UX 设计：更新 `styles.css` 的 `--la-*` 视觉 token，并将主外壳、导航、按钮、输入框、卡片、统计图标、单词结果卡片、设置路径建议和弹窗输入接入统一的外凸/内凹触感样式；设置页路径建议移除旧内联阴影并使用 class-based 样式；本次不改变数据结构、Markdown 存储格式或业务流程。
- 新增 app 页面受限富文本渲染能力：`src/components/common/RichText.tsx` 负责解析基础 Markdown 字体样式和红/蓝/绿白名单颜色标签；单词详情页的备注、定义、例句以及复习答案页的定义、例句已接入；数据仍按原始 Markdown 文本保存，不改变存储格式。
- 单词管理排序下拉框新增“最近添加”选项：按 `itemMeta.createAt` 降序展示，选择后重置到第一页；同时修正原“时间”排序为按 `itemMeta.lastUpdate` 排序；时间缺失时互相兜底，不改变数据结构和存储格式。
- 优化单词详情页信息层级：顶部返回/编辑按钮改为弱化灰色工具按钮，基础信息区改为低对比 meta 文本，详细内容卡片使用更高对比的主体样式，突出定义和例句阅读。
- 增加页面底部安全留白：通过 `--la-bottom-safe-space` 统一作用于主页面、单词管理页面和侧边栏导航，避免 Obsidian 底部状态栏或浮层遮挡页面末尾内容。
- 修复移动端无法启用插件的兼容问题：构建脚本改为使用 `esbuild.config.mjs`，打包目标从 Node 环境调整为 browser 环境，并在构建时将 `process.env.NODE_ENV` 固定为生产值，避免移动端 WebView 中不存在 `process` 导致插件加载失败；`manifest.json` 明确 `isDesktopOnly: false`；移动端打开单词管理页时使用普通 workspace leaf，避免依赖桌面端右侧栏 leaf 行为。本次不改变 `Word` 数据结构、Markdown 存储格式、Obsidian view id、命令或设置字段。
- 重新设计单词详情页层级内容 UI：新增 `WordDetailOutline` 组件，将词性、定义、例句组织为轻量 outline 结构；各层级通过小型 chevron 图标独立折叠/展开，视觉上只保留缩进、淡色引导线和文本权重，不再使用突兀的额外边框或背景；该改动仅影响详情页展示和测验式折叠交互，不改变 Markdown 数据结构或存储格式。
- 优化单词详情页层级折叠图标视觉：保留 chevron 点击区域和键盘焦点能力，但去除圆形背景、阴影感和 hover 圆底，避免图标控件干扰内容层级阅读。
- 修复详情页折叠图标被全局 `.la-page button` 样式覆盖的问题：对 outline 内的 `button.la-detail-toggle` 增加局部样式重置，确保只显示折叠/展开图标本身，不显示白色按钮背景、边框或阴影。

### 2026-06-09

- 调整单词详情页备注展示；备注从基础信息右侧列中移出，作为元信息区直接子项横跨整行展示；样式改为与当前浅灰蓝 Soft UI 配色一致的低对比备注卡片，不改变 `notes` 字段、Markdown 存储格式或编辑逻辑。
- 增强单词详情页富文本渲染；备注、定义、例句中的 Obsidian wiki 链接改为通过原生 Markdown 渲染能力解析，例如 `[[gangs]]`、`[[English-vobs-db#battle|battle]]`，目标文件或标题不存在时保持 Obsidian 默认行为；该改动仅影响详情页展示，不改变 `Word` 数据结构、Markdown 存储格式或编辑逻辑。

### 2026-06-10

- 新增单词管理页随机单词轻量练习工具；支持配置抽取数量、从当前词库无放回随机抽样、显示/隐藏释义、本轮内存态“认识/模糊”判断和查看详情；该功能仅增加曝光率，不写回查询次数、SRS 元数据、`itemMeta`、`lastUpdate` 或 Markdown 存储文件。
