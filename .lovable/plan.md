

# Career Growth Intelligence 数据收集 Bug 修复

## 问题根因

Career Growth Intelligence 面板没有显示所有已分析的面试轮次，原因有两个：

### Bug 1：未遍历 Pipeline 中的 Stages

`CareerGrowthPanel.tsx` 第 66 行只遍历 `job.stages`（顶层扁平数组），但使用了 Pipeline 架构的岗位（如美的）将面试阶段存储在 `job.pipelines[].stages` 中。这导致 Pipeline 内的已分析数据被完全忽略。

### Bug 2：过滤条件过于严格

第 68 行要求 `stage.status === 'completed'`，但实际数据中存在已通过 AI 转录分析器分析过的阶段（包含完整的 questions 和 reflection），但 status 仍为 `pending`（例如 TikTok Round 1）。这些有数据的阶段被错误地排除了。

## 修复方案

### 文件：`src/components/analytics/CareerGrowthPanel.tsx`

修改 `allAnalyzedRounds` 的 useMemo 逻辑（第 45-96 行）：

1. **遍历所有来源**：同时遍历 `job.stages` 和 `job.pipelines[].stages`，使用 Set 去重（按 stage.id）
2. **放宽过滤条件**：将 `stage.status === 'completed' && (questions || reflection)` 改为仅检查数据存在性 `(questions?.length > 0 || reflection)`，不再依赖 status 字段

修改后的逻辑：

```text
对于每个 job:
  1. 收集所有 stages（来自 job.stages + job.pipelines[].stages）
  2. 按 stage.id 去重
  3. 筛选条件：stage.questions?.length > 0 || stage.reflection 存在
  4. 构建 round 数据并推入结果数组
```

### 同步修复：`src/pages/Archive.tsx`

Archive 页面第 42-46 行的 `totalAnalyzedRounds` 计算使用了相同的有缺陷逻辑，需要同步修复以确保解锁阈值计算正确。

## 影响范围

- `src/components/analytics/CareerGrowthPanel.tsx` - 主要修复
- `src/pages/Archive.tsx` - 同步修复解锁计数逻辑

修复后，Career Growth Intelligence 将正确识别所有已分析的面试轮次（预计从当前的 3 个增加到 5-6 个），并将全部数据发送给 AI 进行分析。

