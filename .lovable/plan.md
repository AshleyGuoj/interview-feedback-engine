

## 问题根因

`getHighestStagePriority` 遍历所有 stages 时**不区分状态**。VIVO 虽然只完成了 "Applied"，但它的 pipeline 里有 pending 的 Round 1、Round 2、Final Round（interview, priority=5），导致 `highestPriority = 5 > 2`，applied 事件被跳过。

蚂蚁集团同理。

## 修复

**文件：`src/pages/TimeTracker.tsx`**

修改 `getHighestStagePriority` 函数，只计算 `status === 'completed'` 或 `status === 'scheduled'` 的阶段：

```typescript
function getHighestStagePriority(job: Job): number {
  let max = 0;
  const allStages: InterviewStage[] = [];
  if (job.pipelines?.length) {
    for (const p of job.pipelines) allStages.push(...p.stages);
  } else if (job.stages?.length) {
    allStages.push(...job.stages);
  }
  for (const s of allStages) {
    if (s.status !== 'completed' && s.status !== 'scheduled') continue; // 只看已完成或已安排的
    const cat = s.category || detectStageCategory(s.name);
    const p = STAGE_PRIORITY[cat] ?? 5;
    if (p > max) max = p;
  }
  return max;
}
```

这样 VIVO 只有 Applied (completed, priority=0)，`highestPriority=0 <= 2`，投递事件正常显示。

