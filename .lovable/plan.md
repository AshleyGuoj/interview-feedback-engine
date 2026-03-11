

## 诊断结果：转岗后历史面试记录"消失"

经过对代码完整追踪，发现有**两个问题**叠加导致你看不到之前的面试记录：

### 问题 1：UI 可见性（主因）
`CollapsiblePipelineHistory` 组件默认**折叠**（`defaultExpanded = false`），且位于新 pipeline 下方，视觉上不明显——只有一行灰色小字"历史记录"。用户很容易以为数据丢失了。

### 问题 2：数据完整性风险
`handleCreatePipelineBranch` 中 `job.pipelines` 的旧 pipeline 数据来自内存中的 `dbToJob` 转换（legacy-primary），其 stages 是正确的。但 `jobToDb` 仅序列化 `finalUpdates`（partial），不序列化完整 job，存在边界情况下旧 pipeline stages 可能未完整写入 `_metadata.pipelines` 的风险。

---

### 修复方案

#### 1. 历史 Pipeline 默认展开 + 醒目提示
**文件**: `src/components/jobs/CollapsiblePipelineHistory.tsx`
- 将 `defaultExpanded` 改为 `true`（转岗后首次查看应该能直接看到历史）
- 在 header 中加入"共 N 轮面试记录已保留"的提示文字，让用户明确知道数据没丢

#### 2. 转岗后自动选中新 pipeline 并 toast 提示历史保留
**文件**: `src/pages/JobDetail.tsx`
- 在 `handleCreatePipelineBranch` 的 toast 中加一句说明："历史面试记录已保留在下方"
- 确保 `handleCreatePipelineBranch` 中 `updatedPipelines` 包含旧 pipeline 的完整 stages（加入防御性检查）

#### 3. 防御性数据保护
**文件**: `src/pages/JobDetail.tsx` → `handleCreatePipelineBranch`
- 在构建 `updatedPipelines` 时，如果 `job.pipelines` 为空但 `job.stages` 有数据，手动创建一个 legacy pipeline 对象确保旧 stages 不丢失：

```text
if job.pipelines is empty but job.stages has data:
  → create a legacy pipeline with job.stages
  → include it in updatedPipelines before pausing
```

这是**最关键的防御**，确保从未以 pipeline 格式保存过的老数据在首次转岗时不会被遗漏。

---

### 改动范围
| 文件 | 改动量 | 内容 |
|---|---|---|
| `CollapsiblePipelineHistory.tsx` | ~5 行 | 默认展开 + 保留提示 |
| `JobDetail.tsx` | ~15 行 | 防御性 pipeline 创建 + toast 提示 |

