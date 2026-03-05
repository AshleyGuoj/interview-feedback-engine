

## 问题根因

从数据库看到两个数据问题导致岗位被错误归入"面试"列：

1. **"Applied" 阶段的 category 是 `interview`**：携程、韶音科技等岗位的 "Applied" 阶段存储了 `category: interview`，而不是 `category: application`。因为 Applied 是 `completed + passed`，被算作一个活跃的 interview 阶段，优先级最高，所以归入了面试列。

2. **旧的 `hr_chat` 还在数据库中**：上次拆分 `hr_chat` → `hr_screen`/`hr_final` 后，数据库里的 stages 没有同步更新。

### 修复方案

**第一步：代码防御** — 在 `deriveKanbanColumn` 的逻辑中加入回退映射：
- 遇到 `category: hr_chat` 时，根据名字自动归为 `hr_screen` 或 `hr_final`
- 依赖 `stage.category` 之前，先用 `detectStageCategory(stage.name)` 做二次校验——如果 stage.name 明显是 "Applied" 但 category 标记为 `interview`，以名字检测结果为准

**第二步：数据修复** — 写一个数据库迁移/edge function，遍历所有 jobs 的 stages：
- 将 `category: hr_chat` 根据阶段名称和位置重新映射为 `hr_screen` 或 `hr_final`
- 将名为 "Applied"/"已投递" 但 `category: interview` 的阶段修正为 `category: application`
- 对所有阶段用 `detectStageCategory(name)` 重新计算 category，覆盖错误值

**第三步：防止未来出现同样问题** — 在创建/更新阶段时，确保 `detectStageCategory` 始终被调用来设置默认 category，用户手动选择的 category 才会覆盖默认值。

### 文件改动

| 文件 | 改动 |
|---|---|
| `src/types/job.ts` | `deriveKanbanColumn` 中增加 category 校验逻辑，将 `hr_chat` 回退映射 |
| Edge Function (临时) | 遍历所有 jobs，修正 stages 中错误的 category 值 |
| `src/contexts/JobsContext.tsx` | 保存 stage 时确保 category 经过 `detectStageCategory` 校验 |

