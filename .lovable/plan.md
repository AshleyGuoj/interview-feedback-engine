

# 优化公司/岗位名称可见度

## 问题

当前公司和岗位名称使用了过低的透明度（50%–60% 的 muted-foreground），在浅色背景上几乎消失。

## 方案

将透明度从 `/50`、`/60` 提升到一个"可见但不抢眼"的水平，同时保持层级关系：标题 > 正文 > 公司岗位 > 日期。

### 具体调整

| 位置 | 当前 | 改为 |
|------|------|------|
| Hero 卡片底部公司/岗位 | `text-muted-foreground/50` | `text-muted-foreground` (去掉透明度，用原生 muted 色) |
| Timeline 条目公司/岗位 | `text-muted-foreground/60` | `text-muted-foreground/80` |

这样公司岗位信息不会跟标题抢注意力，但用户扫一眼就能看到。

### 涉及文件

- `src/components/timeline/CareerSignalTimeline.tsx` — Hero 卡片的 context 行（第 209 行）
- `src/components/timeline/SignalTimelineItem.tsx` — Timeline 条目的 context 行（第 87 行）

