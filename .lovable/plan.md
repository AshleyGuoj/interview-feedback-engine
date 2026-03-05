

## 卡片折叠：默认显示最新 5 张，可展开查看全部

### 改动

**`src/components/jobs/KanbanColumn.tsx`**：

1. 添加 `expanded` state（默认 `false`）
2. 将 `filteredJobs` 按 `createdAt` 降序排序（最新在前）
3. 默认只显示前 5 张卡片；当 `expanded` 为 `true` 时显示全部
4. 如果卡片超过 5 张，在底部显示一个"展开更多 (N)"按钮；展开后显示"收起"按钮
5. 切换 filter 时重置 `expanded` 为 `false`

### UI 效果

```text
┌─ 投递/筛选 ──────────┐
│ [投递] [简历筛选] ... │
│ Card 1 (newest)      │
│ Card 2               │
│ Card 3               │
│ Card 4               │
│ Card 5               │
│ ▼ 展开更多 (12)      │
└──────────────────────┘
```

点击后展开所有卡片，按钮变为"▲ 收起"。

只改 `KanbanColumn.tsx` 一个文件，加 2 个翻译 key（`jobs.showMore` / `jobs.showLess`）到 `en.ts` 和 `zh.ts`。

