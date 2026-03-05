

## 两项改动：编辑面板加 Category 选择器 + 面试状态判断逻辑优化

### 问题

1. **编辑信息缺少 Category 字段**：在 EnhancedInterviewTimeline 的"编辑信息"面板中，只有阶段名称、状态、结果、时间，没有 category 选择器。用户无法手动修改 category。
2. **"面试中"状态判断过于宽泛**：当前 `deriveJobStatusFromStages` 逻辑是"只要有任何非 Applied 阶段处于 active 状态就算 interviewing"，导致 HR Screen、Assessment 等阶段也触发"面试中"。

### 改动

**1. `src/components/jobs/EnhancedInterviewTimeline.tsx`**

- `startEditing` 中加载 `category` 到 `editData`
- 编辑表单中，在阶段名称和状态之间（或名称下方）添加 Category 下拉选择器，复用 `STAGE_CATEGORY_CONFIG` 的所有选项
- 当用户修改阶段名称时，自动用 `detectStageCategory` 更新 category 建议（但不覆盖已手动选择的值）

**2. `src/contexts/JobsContext.tsx` — `deriveJobStatusFromStages`**

修改 "interviewing" 的判断逻辑：

```
当前逻辑：任何非 Applied 阶段有活动 → interviewing
新逻辑：必须有 category='interview' 的阶段处于非 pending 状态（scheduled/completed/feedback_pending 等）→ interviewing
```

具体实现：
```ts
// Interviewing: must have an 'interview' category stage with real activity
const interviewActiveStatuses = ['scheduled', 'rescheduled', 'completed', 'feedback_pending'];
const hasRealInterview = normalized.some(
  s => (s.category === 'interview') && interviewActiveStatuses.includes(s.status)
);
if (hasRealInterview) return 'interviewing';
```

这样，HR Screen (hr_chat)、Assessment (assessment) 等阶段的活动不会触发 "interviewing" 状态，只有真正的面试轮次进入 scheduled 或更后面的状态才会。

