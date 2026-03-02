# Nuxt4 重构施工图纸 — DeepFlow AI 深度研究助手

> **文档版本**: v1.0  
> **原型技术栈**: React 18 + Tailwind CSS + Framer Motion + shadcn/ui  
> **目标技术栈**: Nuxt 4 + @nuxt/ui + Tailwind CSS + @vueuse/motion (或 CSS 动画)  
> **最后更新**: 2026-03-02

---

## 目录

1. [布局结构与目录结构总览](#1-布局结构与目录结构总览)
2. [组件拆解清单](#2-组件拆解清单)
3. [@nuxt/ui 映射指南](#3-nuxtui-映射指南)
4. [占位与文案说明](#4-占位与文案说明)
5. [CSS 变量与页面级样式提示](#5-css-变量与页面级样式提示)
6. [状态机与逻辑插槽](#6-状态机与逻辑插槽)

---

## 1. 布局结构与目录结构总览

### 1.1 全局布局结构

```
┌──────────────────────────────────────────────────────────┐
│ 整个应用是 h-screen w-screen flex 横向三栏布局            │
│                                                          │
│ ┌──────────┬──────────────────────────┬──────────┐       │
│ │          │                          │          │       │
│ │  左侧栏   │       主内容区            │  右侧栏   │       │
│ │  260px   │       flex-1             │  280px   │       │
│ │  固定宽度  │                          │  固定宽度  │       │
│ │          │  状态A: WelcomeView       │          │       │
│ │ AppSidebar│  状态B: SkeletonView     │ AgentPanel│       │
│ │          │  状态C: ResearchPlanCard  │          │       │
│ │          │  状态D: ResearchLoading   │          │       │
│ │          │  状态E: MarkdownViewer    │          │       │
│ │          │                          │          │       │
│ └──────────┴──────────────────────────┴──────────┘       │
│                                                          │
│ 注意：当 stage === 'IDLE'（无活跃会话）时，                 │
│ 右侧栏隐藏，主内容区独占剩余空间显示 WelcomeView            │
└──────────────────────────────────────────────────────────┘
```

### 1.2 目录结构

```
project-root/
├── app/
│   ├── app.vue                          # 根组件，挂载 NuxtLayout
│   ├── layouts/
│   │   └── default.vue                  # 默认布局（三栏结构外壳）
│   │
│   ├── pages/
│   │   └── index.vue                    # 首页（状态管理 + 视图切换）
│   │
│   ├── components/
│   │   ├── deep-research/
│   │   │   ├── AppSidebar.vue           # 左侧栏：品牌、新建、搜索、历史列表
│   │   │   ├── WelcomeView.vue          # 欢迎页（含 Hero + Features + Input + QuickTopics + Capabilities + Testimonials + FAQ + Footer）
│   │   │   ├── RightPanel.vue           # 主内容区路由容器（根据 stage 切换子视图）
│   │   │   ├── SkeletonView.vue         # 计划生成中的骨架加载
│   │   │   ├── ResearchPlanCard.vue     # 计划审阅卡片（含修改弹窗）
│   │   │   ├── ResearchLoadingView.vue  # 研究启动加载动画
│   │   │   ├── MarkdownViewer.vue       # Markdown 报告渲染器
│   │   │   ├── AgentPanel.vue           # 右侧 Agent 状态面板
│   │   │   ├── Timeline.vue            # Agent 思考时间线
│   │   │   ├── EditPlanModal.vue        # 修改计划弹窗（独立组件）
│   │   │   │
│   │   │   ├── welcome/                 # WelcomeView 拆解的子组件
│   │   │   │   ├── HeroSection.vue
│   │   │   │   ├── FeatureCards.vue
│   │   │   │   ├── SearchInputBox.vue   # 输入框 + 模式选择器
│   │   │   │   ├── QuickTopics.vue
│   │   │   │   ├── CapabilitiesSection.vue
│   │   │   │   ├── TestimonialsSection.vue
│   │   │   │   ├── FaqSection.vue
│   │   │   │   └── FooterSection.vue
│   │   │   │
│   │   │   └── sidebar/                 # AppSidebar 拆解的子组件
│   │   │       ├── SidebarHeader.vue    # 品牌 + 新建按钮
│   │   │       ├── SidebarSearch.vue    # 搜索输入
│   │   │       └── SessionListItem.vue  # 单条历史记录
│   │   │
│   │   └── ui/                          # 如需自定义的 UI 包装组件
│   │       └── GlassPanel.vue           # 毛玻璃面板容器
│   │
│   ├── composables/
│   │   ├── useSSE.ts                    # SSE 流式请求核心逻辑
│   │   ├── useResearchSessions.ts       # 会话状态管理（sessions 数组、CRUD）
│   │   └── useToastNotification.ts      # Toast 通知封装
│   │
│   ├── types/
│   │   ├── deep-research.ts             # Stage、ThoughtItem、MessageItem、ApiMessage 等
│   │   └── research-session.ts          # ResearchSession 接口
│   │
│   └── assets/
│       └── css/
│           ├── main.css                 # 全局样式（不可修改的基础样式）
│           └── deep-research.css        # 本页面专用的 CSS 变量和工具类
│
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 2. 组件拆解清单

### 2.1 页面级组件

| 组件名 | 文件路径 | 职责 | Props / Emits |
|--------|---------|------|---------------|
| `index.vue` | `pages/index.vue` | 顶层状态管理、会话生命周期控制、SSE 流调度 | 无（页面级） |

### 2.2 布局级组件

| 组件名 | 文件路径 | 职责 | Props |
|--------|---------|------|-------|
| `AppSidebar` | `components/deep-research/AppSidebar.vue` | 左侧栏整体容器 | `sessions`, `activeSessionId` |
| `RightPanel` | `components/deep-research/RightPanel.vue` | 主内容区视图切换 | `stage`, `planText`, `reportMarkdown` |
| `AgentPanel` | `components/deep-research/AgentPanel.vue` | 右侧 Agent 状态面板 | `stage`, `thoughts` |

### 2.3 功能组件（主内容区）

| 组件名 | 文件路径 | 职责 | 交互要点 |
|--------|---------|------|---------|
| `WelcomeView` | `components/deep-research/WelcomeView.vue` | 欢迎页完整视图（含滚动页面） | 输入框自动聚焦、Enter 提交、模式切选、快速主题点击 |
| `SkeletonView` | `components/deep-research/SkeletonView.vue` | 计划生成中骨架屏 | 纯展示，4 行骨架条动画 |
| `ResearchPlanCard` | `components/deep-research/ResearchPlanCard.vue` | 计划审阅 + 操作 | 「开始研究」按钮、「修改计划」打开弹窗 |
| `EditPlanModal` | `components/deep-research/EditPlanModal.vue` | 修改计划弹窗 | textarea 输入、Enter 提交、关闭 |
| `ResearchLoadingView` | `components/deep-research/ResearchLoadingView.vue` | 研究启动过渡动画 | 三步骤进度条动画 |
| `MarkdownViewer` | `components/deep-research/MarkdownViewer.vue` | 报告渲染 + 导出 | 流式自动滚底、导出 PDF 按钮 |
| `Timeline` | `components/deep-research/Timeline.vue` | 思考过程时间线 | 动态追加节点、最新节点脉冲动画 |

### 2.4 WelcomeView 子组件

| 组件名 | 职责 | 交互/动画 |
|--------|------|----------|
| `HeroSection` | 品牌图标 + 标题 + 副标题 | 入场淡入上移动画 |
| `FeatureCards` | 3 列功能卡片网格 | 逐个延迟入场、hover 提升阴影 |
| `SearchInputBox` | 输入框 + 底部模式选择器 + 发送按钮 | focus 时外发光、模式切换高亮、Enter 提交 |
| `QuickTopics` | 2×2 快速话题网格 | hover 变色 + 右箭头位移、点击直接触发研究 |
| `CapabilitiesSection` | 「为什么选择 DeepFlow」2×2 卡片 | 滚动入场动画 |
| `TestimonialsSection` | 3 列用户评价卡片 | 滚动入场动画 |
| `FaqSection` | 手风琴式 FAQ | 点击展开/折叠、箭头旋转 |
| `FooterSection` | 页脚版权信息 | 纯静态 |

### 2.5 AppSidebar 子组件

| 组件名 | 职责 |
|--------|------|
| `SidebarHeader` | 品牌 Logo + 「新建研究」按钮 |
| `SidebarSearch` | 搜索历史记录输入框 |
| `SessionListItem` | 单条会话记录（图标 + 标题 + 日期 + 状态标签） |

---

## 3. @nuxt/ui 映射指南

### 3.1 按钮映射

| 原型位置 | 原 React 组件 | @nuxt/ui 组件 | 配置 |
|---------|-------------|--------------|------|
| 侧边栏「新建研究」 | `<Button size="sm">` | `<UButton size="sm" block>` | icon: `i-lucide-plus`，variant: 默认 solid |
| 输入框发送按钮 | `<Button size="icon">` | `<UButton size="sm" square>` | icon: `i-lucide-send`，`:disabled="!input.trim()"` |
| 计划卡片「开始研究」 | `<Button size="sm">` | `<UButton size="sm">` | icon: `i-lucide-play`，variant: solid |
| 计划卡片「修改计划」 | `<Button variant="ghost" size="sm">` | `<UButton size="sm" variant="ghost">` | icon: `i-lucide-pencil` |
| 弹窗「提交修改」 | `<Button>` | `<UButton>` | icon: `i-lucide-send` |
| 报告「导出 PDF」 | `<Button variant="outline" size="sm">` | `<UButton size="sm" variant="outline">` | icon: `i-lucide-download` |

**样式约束**：所有 `<UButton>` 默认 `cursor: pointer`（@nuxt/ui 已内置），无需额外处理。

### 3.2 输入框映射

| 原型位置 | 原 React 组件 | @nuxt/ui 组件 | 配置 |
|---------|-------------|--------------|------|
| 主输入框（WelcomeView） | `<Textarea>` | `<UTextarea>` | `:rows="3"`, `resize: false`, autofocus |
| 侧边栏搜索 | `<input>` | `<UInput>` | `size="sm"`, icon: `i-lucide-search`, placeholder: `搜索历史记录...` |
| 弹窗内输入 | `<textarea>` | `<UTextarea>` | `:rows="4"`, autofocus |

**⚠️ Focus 样式强约束**：所有 `<UInput>` 和 `<UTextarea>` 必须移除 focus 时的 shadow 效果。通过 `ui` prop 覆盖：

```
:ui="{ focus: 'focus:ring-1 focus:ring-primary focus:shadow-none' }"
```

或在页面级 CSS 中全局覆盖：

```css
/* deep-research.css */
.u-input:focus-within,
.u-textarea:focus-within {
  box-shadow: none !important;
}
```

### 3.3 弹窗映射

| 原型位置 | 原 React 组件 | @nuxt/ui 组件 | 配置 |
|---------|-------------|--------------|------|
| 修改计划弹窗 | `<Dialog>` | `<UModal>` | `max-width: lg`（`sm:max-w-lg`） |

弹窗内部结构：
- 标题：使用 `<UModal>` 的 header slot
- 标题文案：`修改研究计划`
- 描述文案：`输入您的新需求，AI 将根据您的要求重新生成研究计划。`
- 内容区：`<UTextarea>` + `<UButton>`

### 3.4 手风琴映射

| 原型位置 | 原实现 | @nuxt/ui 组件 |
|---------|-------|--------------|
| FAQ 展开/折叠 | 手动 state + 条件渲染 | `<UAccordion>` |

配置项：
```
:items="faqs"
:ui="{ item: { base: 'glass-panel rounded-xl mb-3' } }"
```
每项需配置 `label`（问题文案）和 `content`（回答文案）。

### 3.5 滚动区域映射

| 原型位置 | 原 React 组件 | @nuxt/ui / 原生 |
|---------|-------------|----------------|
| 侧边栏历史列表 | `<ScrollArea>` | 原生 CSS `overflow-y: auto` + `.scrollbar-thin` 工具类 |
| 报告内容区 | `<div ref={scrollRef}>` | 同上 |

### 3.6 Toast 通知映射

| 原型位置 | 原 React 组件 | @nuxt/ui 组件 |
|---------|-------------|--------------|
| SSE 错误通知 | `useToast()` | `useToast()` from @nuxt/ui |

调用方式：
```
const toast = useToast()
toast.add({ title: '请求失败', description: err, color: 'red' })
```

### 3.7 图标映射

原型使用 `lucide-react`，Nuxt 4 使用 `@nuxt/icon` + Iconify Lucide 集合。

映射表：

| lucide-react | @nuxt/icon class |
|-------------|-----------------|
| `Sparkles` | `i-lucide-sparkles` |
| `Send` | `i-lucide-send` |
| `Plus` | `i-lucide-plus` |
| `Search` | `i-lucide-search` |
| `Brain` | `i-lucide-brain` |
| `BookOpen` | `i-lucide-book-open` |
| `FileText` | `i-lucide-file-text` |
| `Play` | `i-lucide-play` |
| `Pencil` | `i-lucide-pencil` |
| `Download` | `i-lucide-download` |
| `ChevronDown` | `i-lucide-chevron-down` |
| `Star` | `i-lucide-star` |
| `MessageSquare` | `i-lucide-message-square` |
| `ArrowRight` | `i-lucide-arrow-right` |
| `Zap` | `i-lucide-zap` |
| `Globe` | `i-lucide-globe` |
| `Shield` | `i-lucide-shield` |
| `TrendingUp` | `i-lucide-trending-up` |
| `Cpu` | `i-lucide-cpu` |
| `Microscope` | `i-lucide-microscope` |
| `Clock` | `i-lucide-clock` |
| `CheckCircle2` | `i-lucide-check-circle-2` |
| `Loader2` | `i-lucide-loader-2` |
| `Lightbulb` | `i-lucide-lightbulb` |

---

## 4. 占位与文案说明

### 4.1 图片占位

当前原型 **无任何图片元素**。用户头像通过首字文字（如 `张`、`李`、`王`）渲染在 `div` 圆形容器中，**不是** `<img>` 标签。若后续需要真实头像，使用：

```html
<img src="" alt="用户头像" width="32" height="32" class="rounded-full" />
```

品牌 Logo 当前使用 `i-lucide-sparkles` 图标，无图片文件。

### 4.2 核心文案清单（不可修改）

以下文案必须**原封不动**复制到 Nuxt 项目中：

#### 品牌与导航
- 品牌名：`DeepFlow`
- 侧边栏「新建研究」按钮：`新建研究`
- 搜索 placeholder：`搜索历史记录...`
- 历史记录标签：`历史记录`
- 暂无记录：`暂无记录`

#### WelcomeView Hero
- H1 标题：`DeepFlow`
- 副标题：`AI 驱动的深度研究助手，自动生成调研计划并执行多维分析，输出专业研究报告`
- 输入框 placeholder：`输入您的研究主题，例如：人工智能在医疗领域的应用前景...`

#### 三列功能卡片（FeatureCards）
| 图标 | 标题 | 描述 |
|------|------|------|
| `i-lucide-brain` | `智能大纲生成` | `AI 自动分析主题，生成结构化研究计划` |
| `i-lucide-book-open` | `深度调研执行` | `多维度搜索与分析，覆盖全面信息源` |
| `i-lucide-file-text` | `Markdown 报告` | `自动生成专业格式的完整研究报告` |

#### 模式选择器（SearchInputBox 底部）
| 图标 | 标签 | 配额数字 | 对应 `deep_search_step` |
|------|------|---------|------------------------|
| `i-lucide-zap` | `快速` | `10` | `1` |
| `i-lucide-trending-up` | `标准` | `15` | `2`（默认选中） |
| `i-lucide-microscope` | `深度` | `20` | `3` |

#### 快速主题（QuickTopics）
| 图标 | 文案 |
|------|------|
| `i-lucide-cpu` | `2025年AI Agent行业全景分析` |
| `i-lucide-trending-up` | `新能源汽车市场竞争格局研究` |
| `i-lucide-brain` | `大语言模型商业化落地路径` |
| `i-lucide-globe` | `Web3与去中心化金融发展趋势` |

#### Capabilities Section
- 标题：`为什么选择 DeepFlow`
- 副标题：`强大的 AI 能力赋予您专业研究员级别的调研效率`

| 图标 | 标题 | 描述 |
|------|------|------|
| `i-lucide-zap` | `极速研究` | `数分钟内完成传统数小时的调研工作，大幅提升效率` |
| `i-lucide-globe` | `全网信息覆盖` | `自动搜索并整合多来源信息，确保调研的全面性与准确性` |
| `i-lucide-shield` | `结构化输出` | `标准化的 Markdown 报告格式，支持导出 PDF 便于分享与归档` |
| `i-lucide-brain` | `自适应计划` | `根据您的反馈实时调整研究方向，灵活应对各类研究需求` |

#### Testimonials Section
- 标题：`用户评价`
- 副标题：`来自各行业用户的真实反馈`

| 姓名 | 角色 | 头像字 | 评分 | 评价内容 |
|------|------|--------|------|---------|
| `张明` | `产品经理` | `张` | 5 | `之前做竞品分析需要整整一天，现在用 DeepFlow 几分钟就能得到一份详尽的调研报告，真的太高效了。` |
| `李薇` | `市场研究员` | `李` | 5 | `信息覆盖面非常广，自动整合多来源数据，让我的市场洞察报告质量提升了一个档次。` |
| `王浩` | `创业者` | `王` | 5 | `作为创业者需要快速了解不同行业，DeepFlow 帮我在短时间内完成了深度行业调研，推荐给所有创业伙伴。` |

#### FAQ Section
- 标题：`常见问题`
- 副标题：`关于 DeepFlow 您可能想了解的`

| 问题 | 回答 |
|------|------|
| `DeepFlow 是如何工作的？` | `DeepFlow 使用先进的 AI 模型分析您的研究主题，自动生成调研大纲，然后通过多维度搜索和智能分析，最终输出结构化的研究报告。` |
| `生成一份研究报告需要多长时间？` | `通常在 3-8 分钟内完成，具体时间取决于研究主题的复杂度。相比传统调研方式，效率提升可达 10 倍以上。` |
| `我可以同时进行多个研究吗？` | `可以。DeepFlow 支持多任务并发，您可以同时发起多个研究任务，它们会在后台独立运行，互不干扰。` |
| `研究报告支持哪些导出格式？` | `目前支持在线阅读和 PDF 导出。报告采用标准 Markdown 格式，便于在各类文档工具中二次编辑。` |

#### Footer
- `© 2024 DeepFlow. AI 驱动的深度研究助手。`

#### 计划卡片（ResearchPlanCard）
- 标题：`研究调研计划`
- 描述：`AI 已为您生成以下研究大纲，请确认后开始深度研究。`
- 按钮：`修改计划` / `开始研究`
- 底部状态文案默认：`Organizing details...`

#### 修改计划弹窗（EditPlanModal）
- 标题：`修改研究计划`
- 描述：`输入您的新需求，AI 将根据您的要求重新生成研究计划。`
- placeholder：`描述您的新需求...`
- 按钮：`提交修改`

#### Agent Panel
- 标题：`Agent`
- 状态文案映射：
  - IDLE → `等待输入...`
  - GENERATING_PLAN → `正在生成计划...`
  - REVIEWING_PLAN → `等待确认计划`
  - RESEARCHING → `深度研究进行中...`
  - COMPLETED → `研究已完成`

#### Timeline 标签
| type | 中文标签 |
|------|---------|
| `thinking` | `思考中` |
| `searching` | `搜索中` |
| `search_result` | `搜索结果` |
| `planning` | `规划中` |
| `writing` | `撰写中` |

#### 会话状态标签（侧边栏）
| stage | 标签 | 颜色 |
|-------|------|------|
| `IDLE` | `待开始` | `text-muted-foreground` |
| `GENERATING_PLAN` | `生成计划中` | `text-primary` |
| `REVIEWING_PLAN` | `待确认` | `text-amber-500` |
| `RESEARCHING` | `研究中` | `text-primary` |
| `COMPLETED` | `已完成` | `text-emerald-500` |

#### 加载视图
- SkeletonView 标题：`正在生成研究计划`
- SkeletonView 副标题：`AI 正在分析您的研究主题...`
- ResearchLoadingView 标题：`正在启动深度研究`
- ResearchLoadingView 副标题：`AI 正在多维度搜索与分析，请稍候...`
- 三步骤：`正在检索相关资料` / `分析与整合信息` / `准备生成研究报告`

#### MarkdownViewer
- 顶栏标题：`研究报告`
- 流式标签：`生成中...`
- 按钮：`导出 PDF`

---

## 5. CSS 变量与页面级样式提示

### 5.1 主题色变量（写入 `deep-research.css`，严禁修改 `main.css`）

以下变量需适配 @nuxt/ui 的 CSS 变量命名规范。如果 @nuxt/ui 使用 `--ui-primary` 等前缀，请对应映射。

```css
/* assets/css/deep-research.css */

:root {
  /* === 强制主题变量（由产品指定，不可修改） === */
  --primary: 240 73.9% 61%;
  --primary-foreground: 0 0% 100%;
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --border: 240 15% 88%;

  /* === 派生变量（使用 Tailwind 默认值，无需覆盖） === */
  /* --card, --popover, --secondary, --muted, --accent, --destructive, --input, --ring */
  /* 以上全部使用 @nuxt/ui / Tailwind 默认值 */

  /* === 页面专用自定义 token === */
  --surface-elevated: 240 20% 98%;
  --glow-primary: 240 73.9% 61%;
  --timeline-line: 240 15% 90%;
  --timeline-dot-active: 240 73.9% 61%;
  --timeline-dot-done: 142 71% 45%;
  --timeline-dot-idle: 240 10% 78%;
}

.dark {
  --primary: 240 73.9% 61%;
  --primary-foreground: 0 0% 100%;
  --background: 240 6.7% 20.6%;
  --foreground: 0 0% 100%;
  --border: 240 16% 94%;

  --surface-elevated: 240 6% 24%;
  --glow-primary: 240 73.9% 65%;
  --timeline-line: 240 8% 35%;
  --timeline-dot-active: 240 73.9% 65%;
  --timeline-dot-done: 142 71% 45%;
  --timeline-dot-idle: 240 6% 45%;
}
```

### 5.2 字体

```css
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
}
```

在 `nuxt.config.ts` 或 `app.vue` 中引入 Google Fonts：
- Inter: weights 300, 400, 500, 600, 700, 800
- Space Grotesk: weights 400, 500, 600, 700

### 5.3 工具类（写入 `deep-research.css` 的 `@layer utilities`）

```css
@layer utilities {
  /* 自定义滚动条 */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar { width: 5px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 9999px;
  }

  /* 毛玻璃面板 */
  .glass-panel {
    @apply bg-white/80 dark:bg-[hsl(240_6%_24%/0.8)] backdrop-blur-xl border border-[hsl(var(--border)/0.5)];
  }

  /* 主色微光 */
  .glow-sm {
    box-shadow: 0 0 20px -5px hsl(var(--glow-primary) / 0.15);
  }

  /* 渐变文字 */
  .text-gradient-primary {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, hsl(var(--primary)), hsl(240 73.9% 72%));
  }

  /* 交互面板 hover 效果 */
  .surface-interactive {
    @apply transition-all duration-200;
    cursor: default;
  }
  .surface-interactive:hover {
    @apply shadow-md;
    border-color: hsl(var(--primary) / 0.2);
  }
}
```

### 5.4 动画（推荐使用 CSS 动画代替 Framer Motion）

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
.animate-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
.animate-blink-cursor { animation: blink-cursor 1s step-end infinite; }
.animate-spin-slow { animation: spin-slow 2s linear infinite; }
```

入场动画延迟可通过内联 `style="animation-delay: 0.1s"` 控制，或使用 `@vueuse/motion` 的 `v-motion` 指令。

---

## 6. 状态机与逻辑插槽

### 6.1 全局状态机（Stage）

```
            用户输入
               │
               ▼
    ┌─────────────────────┐
    │       IDLE          │ ← 默认状态 / 新建研究点击
    └─────────┬───────────┘
              │ handleSend(message, deepSearchStep)
              ▼
    ┌─────────────────────┐
    │  GENERATING_PLAN    │ ← SSE 流: is_deep_search=false, is_edit_plan=false
    │  (显示 SkeletonView) │
    └─────────┬───────────┘
              │ onComplete
              ▼
    ┌─────────────────────┐
    │  REVIEWING_PLAN     │ ← 显示 ResearchPlanCard
    │                     │
    │  ┌── 修改计划 ──┐    │
    │  │ 弹窗输入新需求 │    │
    │  │ 提交 → 回到    │    │
    │  │ GENERATING_PLAN│    │ ← SSE 流: is_edit_plan=true
    │  └───────────────┘    │
    └─────────┬───────────┘
              │ handleStartResearch()
              ▼
    ┌─────────────────────┐
    │    RESEARCHING       │ ← SSE 流: is_deep_search=true
    │                     │
    │  reportMarkdown=''  │ → 显示 ResearchLoadingView
    │  reportMarkdown!='' │ → 显示 MarkdownViewer (isStreaming=true)
    └─────────┬───────────┘
              │ onComplete
              ▼
    ┌─────────────────────┐
    │     COMPLETED        │ ← 显示 MarkdownViewer (isStreaming=false)
    └─────────────────────┘
```

### 6.2 TypeScript 类型定义

```typescript
// types/deep-research.ts

export type Stage = 'IDLE' | 'GENERATING_PLAN' | 'REVIEWING_PLAN' | 'RESEARCHING' | 'COMPLETED'

export interface ThoughtItem {
  id: string
  type: 'thinking' | 'searching' | 'search_result' | 'planning' | 'writing'
  content: string
  timestamp: number
}

export interface MessageItem {
  role: 'user' | 'assistant'
  content: string
}

export interface ApiMessage {
  text: string
}

export interface PlanSection {
  title: string
  description: string
}

export interface SSEEvent {
  event: string
  data: string
}

export interface ChatRequestBody {
  chat_id: number
  model: string
  messages: ApiMessage[]
  is_deep_search: boolean
  is_edit_plan: boolean
  deep_search_step?: number
  key: string
  report_style?: number
  language?: string
}
```

```typescript
// types/research-session.ts

import type { Stage, ThoughtItem, MessageItem } from './deep-research'

export interface ResearchSession {
  id: string
  title: string
  createdAt: string
  stage: Stage
  thoughts: ThoughtItem[]
  messageHistory: MessageItem[]
  planText: string
  reportMarkdown: string
  deepSearchStep: number
}
```

### 6.3 Composable: useResearchSessions

```typescript
// composables/useResearchSessions.ts — 接口签名

interface UseResearchSessions {
  sessions: Ref<ResearchSession[]>
  activeSessionId: Ref<string | undefined>
  activeSession: ComputedRef<ResearchSession | undefined>

  // 更新某个 session
  updateSession(id: string, updater: (s: ResearchSession) => ResearchSession): void

  // 新建研究（创建 session + 切换）
  createSession(message: string, deepSearchStep: number): ResearchSession

  // 切换活跃会话
  selectSession(id: string): void

  // 重置到欢迎页
  resetToWelcome(): void
}
```

### 6.4 Composable: useSSE

```typescript
// composables/useSSE.ts — 接口签名

interface SSECallbacks {
  onThought: (thought: ThoughtItem) => void
  onContent: (chunk: string) => void
  onComplete: (messageId?: string) => void
  onError: (error: string) => void
}

interface SendParams {
  chat_id: number         // 固定值 0
  model: string           // 固定值 'GPT-4.1'
  is_deep_search: boolean
  is_edit_plan: boolean
  deep_search_step?: number  // 1=基础, 2=中等, 3=深度
  report_style?: number
  language?: string          // 固定值 'zh-CN'
}

// 启动一个独立的 SSE 流，返回 abort 函数
function startStream(
  messages: ApiMessage[],
  params: SendParams,
  callbacks: SSECallbacks
): () => void
```

**API 配置**：
- URL: `https://apiv2.wahezu.cn/ai/deep_search/chat`
- 鉴权 Header: `Token: e9QyzZfgMk43Re2tsgwGzFWFHGv3P94g`
- 请求体需包含 `key: crypto.randomUUID() + '-1'`
- messages 格式: `Array<{ text: string }>`（只取 role=user 的消息）

**SSE 事件类型**：
| 事件名 | 处理 | 数据提取 |
|--------|------|---------|
| `thinking` | → `onThought` | `data.status` |
| `searching` | → `onThought` | `data.query` |
| `search_result` | → `onThought` | `data.result` |
| `planning` | → `onThought` | `data.status` |
| `writing` | → `onThought` | `data.status` |
| `content` | → `onContent` | `data.text` |
| `user_message` | → `onComplete` | `data.message_id` |
| `error` | → `onError` | `data.message` |

### 6.5 事件函数插槽（需对接真实接口的函数）

| 函数名 | 触发位置 | 参数 | 行为描述 |
|--------|---------|------|---------|
| `handleSend(message, deepSearchStep)` | WelcomeView 输入框提交 / QuickTopics 点击 | `message: string, deepSearchStep: number` | 创建新 session → stage=GENERATING_PLAN → 启动 SSE(is_deep_search=false, is_edit_plan=false) |
| `handleEditPlan(newRequirement)` | EditPlanModal 提交 | `newRequirement: string` | stage=GENERATING_PLAN → 清空 planText/thoughts → 启动 SSE(is_deep_search=false, is_edit_plan=true) |
| `handleStartResearch()` | ResearchPlanCard「开始研究」 | 无 | stage=RESEARCHING → 清空 reportMarkdown/thoughts → 启动 SSE(is_deep_search=true, is_edit_plan=false, deep_search_step=session.deepSearchStep) |
| `handleNewResearch()` | 侧边栏「新建研究」 | 无 | activeSessionId=undefined → 显示 WelcomeView |
| `handleSelectSession(id)` | 侧边栏历史记录点击 | `id: string` | activeSessionId=id → 恢复该 session 的视图状态 |

### 6.6 多任务并发关键设计

每个 SSE 流通过闭包绑定 `sessionId`，`onThought` / `onContent` / `onComplete` / `onError` 全部通过 `updateSession(sessionId, ...)` 更新对应 session，**与当前活跃视图解耦**。

需要维护的 per-session 引用：
- `abortsMap: Map<string, () => void>` — 每个 session 的 abort 函数
- `planAccumulators: Map<string, string>` — 计划文本累加器
- `reportAccumulators: Map<string, string>` — 报告文本累加器

切换 session 时 **不中断** 任何后台流，仅切换视图读取的数据源。

### 6.7 组件间 Props/Emits 汇总

```
pages/index.vue
├── AppSidebar
│   props: sessions, activeSessionId
│   emits: @new-research, @select-session(id)
│
├── WelcomeView (when IDLE)
│   emits: @send(message, deepSearchStep)
│
├── RightPanel (when active session)
│   props: stage, planText, reportMarkdown
│   emits: @edit-plan(newRequirement), @start-research
│   │
│   ├── SkeletonView (GENERATING_PLAN) — 无 props/emits
│   ├── ResearchPlanCard (REVIEWING_PLAN)
│   │   props: planText
│   │   emits: @edit(requirement), @start
│   │   └── EditPlanModal
│   │       emits: @submit(requirement), @close
│   ├── ResearchLoadingView (RESEARCHING, no report) — 无 props/emits
│   └── MarkdownViewer (RESEARCHING/COMPLETED, has report)
│       props: content, isStreaming
│
└── AgentPanel (when active session)
    props: stage, thoughts
    └── Timeline
        props: thoughts, isActive
```

---

> **文档结束。研发人员请基于此文档在 Cursor 中使用 Nuxt 4 + @nuxt/ui 进行完整重构。所有文案、交互逻辑、组件边界和 CSS 变量均以本文档为准。**
