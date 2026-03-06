

## 问题分析

从截图和代码中发现两个 bug：

### Bug 1：简历筛选仍然显示
`getEventTypeFromStage` 函数对 `resume_screen` 和 `hr_screen` 类别没有专门处理，直接走到默认的 `return 'interview'`，所以"简历筛选"阶段被当作"面试"显示了。

### Bug 2：投递事件消失（VIVO、蚂蚁集团）
`highestPriority <= 1` 的判断本身没问题，但需要确认这些 job 的 stages 是否被正确识别。如果 VIVO/蚂蚁集团只有 `application` 阶段（priority=0），应该显示投递事件。可能的原因是这些 job 有一个 `resume_screen` 阶段且 status=completed，导致 completion event 生成时被错误归类为面试。同时 applied 事件因为 `highestPriority <= 1` 条件也应该显示——需要确认是否有其他 stage 导致 priority > 1。

### 修复方案

**文件：`src/pages/TimeTracker.tsx`**

1. **`getEventTypeFromStage` 添加 resume_screen 和 hr_screen 过滤**：让这两个类别返回 `'applied'`，然后在 stage 遍历中跳过它们（因为 line 109 已经 `if (type === 'applied') continue`）

2. **确保投递事件正确显示**：`highestPriority <= 1` 的逻辑正确，但 `hr_screen` 的 priority 是 2，如果一个 job 有 hr_screen 阶段，priority 就变成 2，导致 applied 事件不显示。需要将阈值调整为包含 `hr_screen`（即 `highestPriority <= 2`），因为 HR 初筛仍然属于"投递阶段"，不应该阻止投递事件的显示。

### 具体改动（约 5 行）

```typescript
// getEventTypeFromStage: 添加 resume_screen 和 hr_screen 映射
if (cat === 'resume_screen' || cat === 'hr_screen') return 'applied';

// extractEvents: 调整阈值，hr_screen 仍算投递阶段
if (highestPriority <= 2) {  // was <= 1
  events.push({ ... applied event ... });
}
```

这样：
- 简历筛选 / HR初筛 的完成事件和安排事件都会被跳过（因为 type='applied' → continue）
- VIVO、蚂蚁集团等只有 applied + resume_screen/hr_screen 的 job 会正确显示投递事件
- 滴滴等已进展到面试/笔试的 job 不会显示投递事件（priority > 2）

