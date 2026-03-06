

## 问题诊断

根据网络请求数据，你今天（3月6日）创建的三个事件：

| 事件 | scheduledTime | 问题 |
|------|---------------|------|
| 京东 Round 1 | 2026-03-09T22:00 | 显示在3月9日 |
| Shopee Team Lead Interview | 2026-03-08T21:00 | 显示在3月8日 |
| 滴滴 笔试 | 2026-03-07T21:00 | 显示在3月7日 |

**根本原因**：Time Tracker 的 `extractEvents` 函数用 `scheduledTime` 作为事件日期。这三个面试/笔试都安排在未来几天，所以它们出现在对应的未来日期上，而不是今天。

今天应该能看到的是：
- 3个 "Applied" 事件（创建了3个新job）
- 3个 HR Screen 完成事件（completedAt 是今天）

如果这些也没显示，可能是 `hr_screen` 类别被归类为 `resume_screen`，但 `resume_screen` 在今日视图中应该正常显示。

## 修复方案

在 `extractEvents` 中，为 `status === 'scheduled'` 的阶段新增一个"安排事件"（scheduling event），日期使用**阶段被安排的时间**（即今天），而不是面试实际发生的日期。这样用户今天安排了面试/笔试，今天就能看到一条记录。

### 具体改动

**`src/pages/TimeTracker.tsx`** — `extractEvents` 函数：

1. 为 `status === 'scheduled'` 且有 `scheduledTime` 的阶段，除了已有的"scheduled event"（放在面试当天），额外生成一个 **"scheduling action" event**：
   - 日期 = 今天或 stage 状态变更时间（可从 `recent_activities` 的 `created_at` 推断，但更简单的做法是用 `job.updatedAt`）
   - label 加 "(已安排)" 后缀
   - 用现有图标但加一个日历标记

2. 新增 `TimelineEvent` 的可选字段 `isSchedulingAction?: boolean`，用于区分"安排动作"和"实际事件"

3. `EventRow` 中对 `isSchedulingAction` 事件显示特殊样式（如浅色 + 日历图标 + 显示实际面试日期作为 sublabel）

### 改动范围
- 仅修改 `src/pages/TimeTracker.tsx`（约20行新增）
- 可能需要在 `en.ts` / `zh.ts` 中添加 1-2 个翻译 key

