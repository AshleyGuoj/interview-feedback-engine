

## 问题根因

上次的数据迁移脚本应该已经更新了所有 job 的 status，但从截图看，很多岗位（携程、TCL、Tiktok Shop、科大讯飞等）仍然显示在"面试中"列，尽管它们当前阶段是"待进行"的 Assessment / HR Screen / Applied，并非 `interview` 类别的已安排状态。

有两个层面的问题需要修复：

### 1. 加载时自动校正 status（防御性措施）

在 `dbToJob()` 函数中，读取数据库数据后调用 `deriveJobStatusFromStages` 重新计算 status，确保即使数据库中存储了错误的 status，前端也能自动修正显示。

**修改文件**: `src/contexts/JobsContext.tsx` — `dbToJob` 函数末尾，在 return 之前：

```ts
const derivedStatus = deriveJobStatusFromStages(job.stages, job.status);
return { ...job, status: derivedStatus };
```

> 注意：需要把 `deriveJobStatusFromStages` 的定义移到 `dbToJob` 之前，或在 `dbToJob` 内部直接计算。

### 2. 再次运行数据库修正

通过边缘函数再跑一次迁移，用更新后的逻辑（必须 category=interview 且 status 为 scheduled/completed 等）重新计算所有 job 的 status 字段，把不符合条件的从 `interviewing` 改回 `applied`。

这两步结合，确保：
- 数据库中的 status 被修正（持久化）
- 即使有遗漏，前端加载时也会自动校正（兜底）

