

# Career Growth Page UI/UX 精细化优化方案

## 当前问题

1. **荧光色泛滥**：Insight Summary 使用 emerald-50/amber-50 背景 + emerald-700/amber-700 文字；Stable Advantages 使用 blue-50/blue-100；Strengths vs Gaps 图表使用荧光 emerald-500 和 amber-500；趋势详情使用 emerald-50/red-50 背景
2. **AI emoji**：Tab 栏有 "✨" emoji（第103行）
3. **Card 过多**：结果视图连续 6-7 个 Card 堆叠，视觉沉重
4. **图表品牌色不统一**：StrengthsGapsChart 使用硬编码 emerald/amber，Legend 用中文硬编码

## 改造内容

### 1. Archive.tsx — 移除 emoji，精简 Tab

| 位置 | 当前 | 改为 |
|------|------|------|
| 第103行 | `✨` emoji span | 删除整个 span |

### 2. CareerGrowthPanel.tsx — 主面板重构

#### 2a. 颜色统一（移除所有荧光语义色）

| 位置 | 当前 | 改为 |
|------|------|------|
| getTrendIcon improving（第149行） | `text-emerald-500` | `text-primary` |
| getTrendColor improving（第160行） | `text-emerald-600 bg-emerald-50 border-emerald-200` | `text-primary bg-primary/5 border-primary/20` |
| getTrendColor declining（第162行） | `text-red-600 bg-red-50 border-red-200` | `text-destructive bg-destructive/5 border-destructive/20` |
| Insight "Biggest Change" Card（第319-338行） | `border-emerald-200 bg-emerald-50/30`, `text-emerald-700`, `text-emerald-600` | `border-primary/20 bg-primary/5`, `text-primary`, `text-primary/80` |
| Insight "Biggest Risk" Card（第341-361行） | `border-amber-200 bg-amber-50/30`, `text-amber-700`, `text-amber-600` | `border-muted-foreground/20 bg-muted/30`, `text-muted-foreground`, `text-muted-foreground` |
| Lightbulb icon（第456行） | `text-amber-500` | `text-primary` |
| Priority number circles（第466-468行） | `bg-red-100 text-red-700` / `bg-amber-100 text-amber-700` / `bg-gray-100 text-gray-700` | 全部统一为 `bg-primary/10 text-primary` |
| Stable Advantages Card（第488行） | `border-blue-200 bg-blue-50/30` | `border-primary/20 bg-primary/5` |
| Stable Advantages title（第490行） | `text-blue-700` | `text-primary` |
| Stable Advantages badges（第498行） | `text-blue-700 bg-blue-100` | `text-primary bg-primary/10` |

#### 2b. 减少 Card，改用 Open Section

以下区域从 Card 包裹改为 border-l accent 开放区域：

- **Competency Trends 详情**（第410-448行）：从 Card 改为 `border-l-2 border-l-primary/30 pl-5` 开放区域
- **Next Growth Priorities**（第451-483行）：从 Card 改为 `border-l-2 border-l-muted-foreground/30 pl-5` 开放区域
- **Stable Advantages**（第486-504行）：从 Card 改为内联 badge 区域，无 Card 包裹

保留 Card 的区域（图表需要边框容器）：
- Coach Message（保留，已使用品牌色）
- Competency Line Chart（保留）
- Radar Chart（保留）
- Strengths vs Gaps Bar Chart（保留）

#### 2c. Insight Summary 从双 Card 改为单行对比条

将两个并排 Card 合并为一个更紧凑的对比展示：

```text
┌──────────────────────────────────────────────────┐
│  ↗ Biggest Improvement        │  ↘ Key Risk      │
│  · improvement item 1         │  · risk item 1   │
│  · improvement item 2         │  · risk item 2   │
└──────────────────────────────────────────────────┘
```

用一个 Card 内部左右分栏（`grid grid-cols-2 divide-x`），减少 Card 数量。

### 3. StrengthsGapsChart.tsx — 品牌色修正

| 位置 | 当前 | 改为 |
|------|------|------|
| getBarColor strength（第52行） | `hsl(142, 71%, 45%)` (emerald) | `hsl(var(--primary))` |
| getBarColor gap（第53行） | `hsl(47, 96%, 53%)` (amber) | `hsl(var(--muted-foreground))` |
| Legend strength 色块（第61行） | `bg-emerald-500` | `bg-primary` |
| Legend gap 色块（第65行） | `bg-amber-500` | `bg-muted-foreground` |

### 4. CompetencyRadarChart.tsx — 无需改动

已经使用 `hsl(var(--primary))` 和 `hsl(var(--muted-foreground))`，品牌色一致，保持不变。

### 5. CompetencyLineChart.tsx — 无需改动

已使用 CSS 变量色板（`--primary`, `--chart-1` 等），保持不变。

## 涉及文件

| 文件 | 改动类型 |
|------|----------|
| `src/pages/Archive.tsx` | 移除 emoji |
| `src/components/analytics/CareerGrowthPanel.tsx` | 颜色统一 + 布局重构 |
| `src/components/analytics/charts/StrengthsGapsChart.tsx` | 品牌色修正 |

## 改造后视觉层次

```text
── Coach Message (Card, bg-primary/5) ──────────────────
── Insight Summary (单 Card, 左右分栏对比) ─────────────
── Competency Line Chart (Card) ─────────────────────────
── Radar Chart: Past vs Current (Card) ──────────────────
── Strengths vs Gaps Bar Chart (Card) ───────────────────
── Trend Details (Open Section, border-l accent) ────────
   · improving trend item...
   · stable trend item...
── Next Priorities (Open Section, border-l accent) ──────
   1. Focus area...
   2. Focus area...
── Stable Advantages (inline badges, no Card) ───────────
```

图表保留 Card 边框提供视觉容器，文字内容改为轻量开放区域，减少约 3 个 Card，页面更通透。

