

# Timeline + Interview Analysis 视觉层次优化方案

## 核心问题

两个页面目前只使用 primary (indigo)、muted-foreground (gray)、foreground (near-black) 三种颜色。所有板块视觉上"糊在一起"，缺乏节奏感和故事感，用户没有继续 scroll 的动力。

## 设计策略

引入 **4 个语义色调** 作为 CSS 变量，在保持品牌克制的同时创造视觉区分：

| 语义 | 用途 | 色值 (Light) | 色值 (Dark) |
|------|------|-------------|-------------|
| `--accent-warm` | 转折点/offer/正向信号 | 温暖琥珀 `32 45% 46%` | `32 40% 52%` |
| `--accent-cool` | 面试洞察/分析区域 | 冷调蓝灰 `210 30% 50%` | `210 28% 56%` |
| `--accent-sage` | 优势/正面反馈 | 鼠尾草绿 `158 25% 42%` | `158 22% 48%` |
| `--accent-rose` | 风险/改进空间 | 玫瑰灰 `350 30% 52%` | `350 28% 56%` |

这些色调不是荧光色，而是 desaturated、有质感的中性色，与现有 `--primary` (indigo) 形成互补但不冲突。

---

## 改造内容

### 1. CSS 变量注册（`src/index.css`）

在 `:root` 和 `.dark` 中添加 4 个语义变量 + 对应的 Tailwind utilities。

### 2. Timeline Page — 信号类型色彩分化

**Hero Signal Card**（CareerSignalTimeline.tsx）：
- turning_point：左边框从 `border-l-primary/30` 改为 `border-l-[hsl(var(--accent-warm))]`，类型标签用 `accent-warm` 色
- strong_signal：类型标签用 `accent-cool` 色

**Signal Timeline Items**（SignalTimelineItem.tsx）：
- turning_point dot：从 `bg-primary` 改为 `bg-[hsl(var(--accent-warm))]`
- strong_signal dot：从 `bg-primary/60` 改为 `bg-[hsl(var(--accent-cool))]`
- 类型标签颜色跟随 dot 颜色
- turning_point 卡片左边框用 warm 色

**Momentum Indicator**（MomentumIndicator.tsx）：
- improving 状态图标和标签：从 `text-success` 改为 `text-[hsl(var(--accent-sage))]`
- declining 状态：改为 `text-[hsl(var(--accent-rose))]`

**Patterns Discovered**（PatternsList.tsx）：
- risk dot 颜色映射到新的语义色调：low = accent-sage, medium = accent-warm, high = accent-rose
- risk pill 样式同步更新

### 3. Interview Analysis Page — 板块色彩分化

**AnalysisDetailPanel.tsx — 已分析状态**：
- "Interview Questions" section icon：保持 primary（分析/数据感）
- "Interview Debrief" section icon：改为 `accent-cool`（洞察/反思感）
- "What Went Well" border-l：从 `primary/40` 改为 `accent-sage`（正向反馈）
- "What Could Improve" border-l：从 `muted-foreground/30` 改为 `accent-rose/40`（改进空间）
- Key Takeaways 背景：添加轻微 `accent-cool` tint
- Feeling icons：great/good 用 `accent-sage`，poor/bad 用 `accent-rose`

**AnalysisDetailPanel.tsx — 新分析结果**：
- QuestionCard 中 quality badge：high 用 `accent-sage`，low 用 `accent-rose`
- ReflectionDisplay 中同步上述 "What Went Well"/"Could Improve" 色彩

**AnalysisResults.tsx**（独立分析页面）：
- Key Strengths section icon：从 `bg-success/10 text-success` 改为 `bg-[hsl(var(--accent-sage))]/10 text-[hsl(var(--accent-sage))]`
- Key Risks section icon：从 `bg-warning/10 text-warning` 改为 `bg-[hsl(var(--accent-rose))]/10 text-[hsl(var(--accent-rose))]`
- CheckCircle2 in strengths：用 `accent-sage`
- AlertTriangle in risks：用 `accent-rose`
- Lightbulb "Lessons for Future"：用 `accent-warm`

### 4. career-signals.ts 类型配置

更新 `MOMENTUM_CONFIG` 和 `SIGNAL_TYPE_CONFIG` 中的 color 字段以引用新的语义色。

---

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/index.css` | 添加 4 个语义色变量 + utility classes |
| `src/types/career-signals.ts` | 更新 config color 字段 |
| `src/components/timeline/CareerSignalTimeline.tsx` | Hero card 色彩分化 |
| `src/components/timeline/SignalTimelineItem.tsx` | Signal dot + label 色彩 |
| `src/components/timeline/MomentumIndicator.tsx` | Momentum 状态色 |
| `src/components/timeline/PatternsList.tsx` | Risk dot + pill 色彩 |
| `src/components/analytics/AnalysisDetailPanel.tsx` | 板块色彩分化 |
| `src/components/interview/AnalysisResults.tsx` | Section icon + item 色彩 |

## 设计原则

- 不引入荧光色，所有新色调 saturation 控制在 25-45% 之间
- 色调有语义含义（warm=转折/机会，sage=优势，rose=风险，cool=洞察），用户潜意识可以区分不同信息类型
- 每个板块有自己的视觉"温度"，scroll 时能感受到节奏变化
- Dark mode 下同步调整，保持对比度

