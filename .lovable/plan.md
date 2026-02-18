

# Role Debrief UI/UX 优化方案

## 问题诊断

1. **AI 感过重**：大量使用荧光色 emoji（🎯⚡🤖💪👑等）、鲜艳的语义色（emerald/amber/red 背景卡片）、百分比进度条，给人"AI 生成报告"的感觉
2. **容器形式单一**：所有区块都用 Card + border，视觉节奏重复
3. **配色刺眼**：Key Insights 三列使用蓝/绿/黄三色底色卡片，色彩过于分散，缺乏品牌一致性

## 改造策略

### 1. Emoji 替换为 Lucide 图标

将 `COMPETENCY_CONFIG` 和 `HIRING_LIKELIHOOD_CONFIG` 中的 emoji 全部替换为 Lucide 图标组件，保持 icon 的信息传达但去除"AI 玩具感"。

| 能力项 | 当前 Emoji | 改为 Lucide 图标 |
|--------|-----------|-----------------|
| Product Sense | 🎯 | `Crosshair` |
| Execution | ⚡ | `Zap` |
| Analytics | 📊 | `BarChart3` |
| Communication | 💬 | `MessageSquare` |
| Technical Depth | 🔧 | `Wrench` |
| AI Skills | 🤖 | `Brain` |
| System Design | 🏗️ | `Blocks` |
| Strategy | 📈 | `TrendingUp` |
| Leadership | 👑 | `Crown` |
| Resilience | 💪 | `Shield` |

Hiring Likelihood 的 emoji（⚠️🤔🎉）也替换为对应 Lucide 图标。

### 2. 配色统一：去掉语义色，回归品牌灰紫

| 位置 | 当前 | 改为 |
|------|------|------|
| Hiring Likelihood 卡片 | `bg-emerald-50 / bg-amber-50 / bg-red-50` + 彩色边框 | 统一用 `surface-insight` 底色 + `border-l-3` 左侧品牌色线（强度用线的颜色深浅区分） |
| Competency 分数色 | `text-emerald-600 / text-amber-600 / text-red-600` | 统一用 `text-primary` 显示分数，用进度条粗细/填充度表达高低 |
| Key Insights 三列 | 蓝/绿/黄三色底色卡片 | 去掉彩色底色，改为无边框开放区块 + 左侧竖线（与 Timeline 页风格一致） |
| 表格高亮/风险色 | `text-emerald-600 / text-amber-600` | 改为 `text-foreground` + `text-muted-foreground`，用 icon 区分而非颜色 |

### 3. 容器混搭

| 区块 | 当前 | 改为 |
|------|------|------|
| Hiring Likelihood | Card + border-2 彩色 | 保留为唯一大卡片，但去掉彩色边框，改为 `border-l-3 border-l-primary/40` + subtle bg |
| Interviewer Matrix | Card | 保留 Card（表格需要容器） |
| Competency Heatmap | Card 包裹的 grid | 去掉外层 Card，改为开放区块 + 标题分隔线 |
| Key Insights 三列 | 三个彩色 Card | 去掉 Card，改为 `border-l-2` 竖线开放区块 |
| Next Actions | Card | 改为浅底色无边框区块（`rounded-xl bg-muted/20`） |

### 4. 分数展示优化

Competency Heatmap 的分数从鲜艳底色数字改为更精致的呈现：
- 分数用 `text-primary font-semibold` 显示（不再用彩色底色块）
- 添加一个 5 格小方块指示器（填充格数 = 分数），用 `bg-primary/20`（空）和 `bg-primary`（满）表示
- 整体更像数据仪表盘而非 AI 生成结果

### 涉及文件

- `src/types/role-debrief.ts` — 将 `icon: string` 改为 `icon: string`（Lucide 图标名），移除 emoji；调整 `HIRING_LIKELIHOOD_CONFIG` 颜色
- `src/components/analytics/RoleDebriefPanel.tsx` — 重构容器样式、配色、图标渲染

