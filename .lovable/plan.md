

## 代码审查：状态流转逻辑 + 改进建议

### 整体评价
架构设计合理——Pipeline Resolver 作为确定性 FSM、Stage 的二维模型（Status + Result）、以及基于 category 优先级的 Kanban 列派生，都是好的设计决策。以下是发现的问题和改进点：

---

### 🔴 Bug / 逻辑问题

**1. `deriveApplicationSubCategory` 默认选中不匹配实际筛选逻辑**
- `KanbanColumn` 中 `activeAppFilter` 默认为 `'application'`，但 `filteredJobs` 的条件是 `activeAppFilter !== 'application'` 时才过滤。这意味着默认选中"投递"时实际显示的是**全部**卡片（application + resume_screen + assessment + written_test），标签语义不一致。
- **修复**：要么添加 `'all'` filter 作为默认值（类似面试列的 `'all_interview'`），要么在 `activeAppFilter === 'application'` 时也做过滤只显示投递类卡片。

**2. `deriveInterviewSubCategory` 对 skipped 阶段也增加 interviewIndex**
- 第 485-488 行：skipped/withdrawn 的面试阶段也会增加 `interviewIndex`，导致如果第一轮被跳过、第二轮是 frontier，会被分类为 `round_2` 而非 `round_1`。对用户来说跳过的轮次不应计入轮次编号。
- **修复**：skipped/withdrawn 的面试阶段不增加 `interviewIndex`。

**3. `deriveJobStatusFromStages`（JobsContext.tsx）与 Pipeline Resolver 存在重复/冲突**
- `deriveJobStatusFromStages` 按 stage name 包含 "offer" 来判断 offer 状态，而 Pipeline Resolver 同时要求 `status === 'completed' && result === 'passed'`。两套逻辑可能产生不一致。
- **建议**：统一使用 Pipeline Resolver 作为唯一 status 来源，移除 `deriveJobStatusFromStages` 或标记为 deprecated。

**4. `on_hold` result 不会中断 stage 遍历导致状态遗漏**
- Pipeline Resolver 第 196-199 行：遇到 `on_hold` result 时不 break，继续遍历后续 stages。如果后续有 pending stage，`activeStage` 会被设为那个 pending stage，on_hold 信号被忽略。
- **影响**：HC 冻结的 stage 如果后面还有 pending stages，resolver 会显示 "Next Interview" 而非 "On Hold"。

---

### 🟡 可改进项

**5. `StageStatus` 组件（StageStatus.tsx）未被使用**
- `JobCard` 使用的是 `PipelineStatus`，`StageStatus` 看起来是旧版遗留。可以清理删除以减少混淆。

**6. 投递列应与面试列一致，添加"全部"按钮**
- 面试列有 `all_interview` 作为默认显示全部，投递列没有——默认选中"投递"但实际显示全部，UX 不一致。
- **建议**：为投递列也添加 `'all'` filter pill。

**7. `resolvePipeline` 被多次调用**
- `JobCard` 调用一次，`PipelineStatus` 又调用一次——同一个 job 被 resolve 两次。
- **建议**：在 `JobCard` 中 resolve 一次，将 `resolution` 传给 `PipelineStatus`。

**8. Kanban 列缺少 "HR Chat" 列**
- Memory 提到 6 列 pipeline 包含 HR Chat，但 `KANBAN_COLUMNS` 只有 5 列（application_assessment, interview, offer_call, offer_received, closed）。`hr_final` 被映射到 interview 列，`hr_screen` 被映射到 application_assessment 列。如果需要单独展示 HR 阶段，需要加列。

---

### 建议优先级

| 优先级 | 问题 | 改动量 |
|--------|------|--------|
| P0 | #1 投递列 filter 语义不一致 | 小 |
| P0 | #2 skipped 阶段错误增加 interviewIndex | 小 |
| P1 | #4 on_hold 遍历不中断 | 小 |
| P1 | #7 resolvePipeline 重复调用 | 小 |
| P2 | #3 双重 status 派生逻辑 | 中 |
| P2 | #5 清理 StageStatus 遗留组件 | 小 |
| P2 | #6 投递列添加"全部"pill | 小 |

需要我修复这些问题吗？可以按优先级分批处理。

