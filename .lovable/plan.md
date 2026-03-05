

## 修复筛选逻辑：基于"当前所处阶段"而非"最高已完成阶段"

### 问题分析

当前 `deriveApplicationSubCategory` 只看 `ACTIVE_STATUSES`（scheduled/rescheduled/completed/feedback_pending），而 `pending` 不在其中。所以一个 "Applied: completed+passed, Resume Screen: pending" 的 job 只匹配到 `application`，不会出现在简历筛选 filter 里。

### 用户期望的逻辑

筛选应基于 job 的**当前所处阶段**（frontier stage）：

1. 从前往后扫描 stages，找到第一个"未通过"的阶段
2. 规则：
   - 如果某 stage `completed` + `passed` → 已通过，继续看下一个
   - 如果某 stage `completed` + 无 result / `feedback_pending` → 当前阶段就是这个（还在等反馈）
   - 如果某 stage `pending` / `scheduled` / `rescheduled` → 当前阶段就是这个
3. 用这个 frontier stage 的 category 决定 filter 归属

### 改动

**`src/types/job.ts` — 重写 `deriveApplicationSubCategory`**：

```typescript
export function deriveApplicationSubCategory(job: Job): ApplicationAssessmentFilter {
  const stages = getActiveStages(job);
  
  // Find the frontier stage: first stage that isn't fully passed
  for (const stage of stages) {
    const category = stage.category || detectStageCategory(stage.name);
    
    // Skip stages that are fully passed (completed + passed)
    if (stage.status === 'completed' && stage.result === 'passed') continue;
    // Skip skipped/withdrawn stages
    if (stage.status === 'skipped' || stage.status === 'withdrawn') continue;
    
    // This is the current frontier stage
    // Map to filter category if it's in the column's scope
    const columnCategories = ['application', 'resume_screen', 'assessment', 'written_test', 'hr_screen'];
    if (columnCategories.includes(category)) {
      return (category === 'hr_screen' ? 'resume_screen' : category) as ApplicationAssessmentFilter;
    }
    
    // Frontier is outside this column's scope → default to application
    return 'application';
  }
  
  return 'application';
}
```

只改这一个函数，其余文件不变。

### 效果示例

- Applied ✅ passed → Resume Screen pending → filter = `resume_screen` ✅
- Applied ✅ passed → Resume Screen completed (等反馈) → filter = `resume_screen` ✅
- Applied ✅ passed → OA pending → filter = `assessment` ✅
- Applied ✅ passed → 笔试 scheduled → filter = `written_test` ✅
- 全部都是 pending → filter = `application`

