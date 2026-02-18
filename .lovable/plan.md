

# Analytics Job Tree 优化方案

## 当前状态

- 已有搜索功能（fuzzy match by company + role）
- 排序按 `updatedAt` 降序（最近更新在前）
- 没有区分活跃/已结束岗位的排序逻辑
- 没有 filter 功能

## 改造内容

### 1. 排序优化：活跃岗位优先，已结束沉底

将排序逻辑改为两层：
- 第一层：活跃岗位（applied/interviewing/offer）排在前面，已结束岗位（closed）排在后面
- 第二层：同组内按 `updatedAt` 降序

已结束的岗位用视觉区分（opacity 降低 + 分组标签 "Closed"），让用户一眼区分。

### 2. 添加 Filter 功能

在搜索框下方添加一排 filter 按钮（pill 样式，与 Timeline 页的 signal filter 风格一致）：

| Filter | 说明 |
|--------|------|
| All | 显示所有岗位（默认） |
| Active | 仅显示 applied/interviewing/offer 状态 |
| With Records | 仅显示有面试记录（questions 或 reflection）的岗位 |
| Closed | 仅显示已结束的岗位 |

### 3. 已结束岗位视觉淡化

Closed 状态的岗位行添加 `opacity-60`，与 Unified Interview Timeline 中对非活跃 pipeline 的处理一致，让用户聚焦于当前进行中的岗位。

### 4. 品牌色一致性修正

- `CheckCircle2` 图标从 `text-emerald-500` 改为 `text-primary`（与 Job Board/Dashboard 统一后的品牌色体系一致）
- `Lightbulb` 图标从 `text-amber-500` 改为 `text-primary/70`

## 涉及文件

仅 `src/components/analytics/AnalyticsJobTree.tsx`

## 技术细节

```text
排序逻辑：
┌─────────────────────────────┐
│  Active Jobs (by updatedAt) │  ← applied / interviewing / offer
├─────────────────────────────┤
│  ── Closed ──               │  ← 分组标签
│  Closed Jobs (by updatedAt) │  ← closed
└─────────────────────────────┘
```

Filter 状态类型：
```
type FilterType = 'all' | 'active' | 'with_records' | 'closed';
```

Filter UI 放在搜索框和列表之间，使用与 CareerSignalTimeline 相同的 pill tab 样式（`rounded-lg bg-muted/50 p-0.5`），保持全站交互一致性。

