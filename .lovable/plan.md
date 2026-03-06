

## Time Tracker 逻辑重构计划

用户提出了 4 个核心问题和 5 个补充建议。以下是分优先级的改动方案。

---

### 改动 1：Applied Event 不再被后续阶段抹掉

**现状**：`highestPriority > 2` 时投递事件消失
**改为**：只要 job 存在任意 applied 类阶段（application/resume_screen/hr_screen）且 status=completed，就无条件生成一条 Applied Event。日期取 `job.createdAt`。

删除 `getHighestStagePriority` 函数，改为简单检查：

```typescript
const hasCompletedApplied = allStages.some(s => {
  const cat = s.category || detectStageCategory(s.name);
  return ['application', 'resume_screen', 'hr_screen'].includes(cat) 
    && s.status === 'completed';
});
if (hasCompletedApplied) {
  events.push({ id: `applied-${job.id}`, type: 'applied', date: parseISO(job.createdAt), ... });
}
```

### 改动 2：resume_screen / hr_screen 完成事件恢复显示

**现状**：type=applied 的阶段全部 `continue` 跳过
**改为**：只跳过 `application` 类别。`resume_screen` 和 `hr_screen` 的 completed 事件保留，归入 `applied` 分类显示（如"通过简历筛选 ✓"、"完成 HR 初筛 ✓"）。

```typescript
// 不再把 resume_screen/hr_screen 映射为 'applied' 然后跳过
// 而是新增一个 'screening' 概念：仍归入 applied 分组，但 completed 事件会生成
if (cat === 'application') return 'applied';  // 这个跳过
if (cat === 'resume_screen' || cat === 'hr_screen') return 'screening';
```

不过这会增加复杂度。更简洁的方案：保持映射为 `applied`，但把跳过逻辑改为**只跳过 application 类别本身**（而不是所有 applied type）：

```typescript
const cat = stage.category || detectStageCategory(stage.name);
if (cat === 'application') continue; // 只跳过 application，不跳过 resume_screen/hr_screen
```

然后 resume_screen/hr_screen 的 scheduled/completed 事件正常生成，归入 Applied 分组。

### 改动 3：Completion Event 时间 fallback 收紧

**现状**：`stage.completedAt || job.updatedAt || job.createdAt`
**改为**：

```typescript
const completionDate = stage.completedAt || stage.updatedAt;
if (!completionDate) continue; // 没有可靠时间，不生成，避免错误日期
```

### 改动 4：同阶段同日 scheduled + completed 合并

**现状**：同一阶段可能在同一天产生 scheduled event + completion event
**改为**：如果 stage.status=completed 且 completedAt 与 scheduledTime/date 是同一天，则只生成 completion event，不生成 scheduled event。

```typescript
const isCompletedSameDay = stage.status === 'completed' 
  && stage.completedAt && timeStr 
  && isSameDay(parseISO(stage.completedAt), parseISO(timeStr));
if (!isCompletedSameDay) {
  // 生成 scheduled event
}
```

### 改动 5：deadline 语义区分

**现状**：`stage.scheduledTime || stage.date || stage.deadline` 混在一起
**改为**：deadline 单独处理，加 `isDeadline: true` 标记，文案显示"截止"

```typescript
// TimelineEvent 增加字段
isDeadline?: boolean;

// 生成逻辑拆分
const eventTime = stage.scheduledTime || stage.date;
if (eventTime) { /* scheduled event */ }
if (stage.deadline && stage.deadline !== eventTime) {
  events.push({ ..., isDeadline: true, date: parseISO(stage.deadline), label: `${company} — ${stage.name}` });
}
```

UI 上 deadline 事件显示 `⏰ 截止` 后缀。

### 改动 6：兜底类型 `other`

**现状**：未匹配阶段全部归 `interview`
**改为**：新增 `other` EventType，灰色图标 (Circle)，用于 background_check 等未来阶段。

### 不做的改动

- **Scheduling Action Event 双显问题**：保持现状，文案已有区分（`CalendarPlus` 图标 + "已安排"后缀 vs 正常图标）。月视图暂不特殊处理，等用户反馈再迭代。
- **时区统一规则**：当前使用浏览器本地时区（`parseISO` 默认行为），暂不改。
- **Stage ID 去重**：当前用 `jobId-stageId` 作为 event ID，已天然去重。

---

### 涉及文件

1. `src/pages/TimeTracker.tsx` — 主要逻辑重构
2. `src/lib/i18n/locales/en.ts` — 新增 `type_screening`、`type_other`、deadline 相关文案
3. `src/lib/i18n/locales/zh.ts` — 同上中文版

