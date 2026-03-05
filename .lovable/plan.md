

## 看板列重组：解决 HR 沟通定位 + 更细粒度分列

### 问题分析

1. **HR 沟通有两种场景**：早期 HR 初筛（投递后、面试前）vs 后期 HR 谈薪（面试后、Offer 前）。当前把 `hr_chat` 固定放在面试之后是不准确的。
2. **流程顺序不对**：实际中常见 投递 → 测评/笔试 → 简历筛选 → 面试，而不是当前的 投递/筛选 → 测评/笔试。
3. **Offer 需要拆分**：Offer Call（谈薪）和 收到 Offer 应该分开。

### 方案：7 列看板 + HR 沟通拆分

**将 `hr_chat` 拆成两个 category**：
- `hr_screen`（HR 初筛）— 早期，归入"筛选"阶段
- `hr_final`（HR 谈薪）— 后期，在面试和 Offer 之间

**新的 7 列布局**：

```text
投递/测评 → 筛选 → 面试 → HR谈薪 → Offer沟通 → 收到Offer → 已关闭
```

| 列 | 包含的 category | 说明 |
|---|---|---|
| 投递/测评 | `application` + `assessment` + `written_test` | 早期阶段 |
| 筛选 | `resume_screen` + `hr_screen` | 简历筛选 + HR初筛 |
| 面试 | `interview` | 核心面试轮次 |
| HR谈薪 | `hr_final` | 面试后的HR沟通/谈薪 |
| Offer沟通 | `offer_call` | 谈 Offer 细节 |
| 收到Offer | `offer_received` | 已拿到 Offer |
| 已关闭 | 终态 | 被拒/放弃/冻结 |

### 技术改动

**`src/types/job.ts`**：
1. `StageCategory` 类型：将 `hr_chat` 替换为 `hr_screen` | `hr_final`
2. `KanbanColumnType` 改为 7 列：`application_assessment` | `screening` | `interview` | `hr_final` | `offer_call` | `offer_received` | `closed`
3. 更新 `CATEGORY_PRIORITY`、`categoryToColumn`、`KANBAN_COLUMN_CONFIG`、`KANBAN_COLUMNS`
4. 更新 `STAGE_CATEGORY_CONFIG` 和 `detectStageCategory`：
   - `hr_screen`：匹配 "HR screen", "recruiter call", "HR初筛"
   - `hr_final`：匹配 "HR谈薪", "salary", "HR final", "谈心"
5. 更新 `deriveKanbanColumn` 优先级

**`src/components/jobs/KanbanColumn.tsx`**：适配 7 列配置

**`src/components/jobs/EnhancedInterviewTimeline.tsx`**：编辑面板的 category 选项更新（`hr_chat` → `hr_screen` / `hr_final`）

**`src/lib/i18n/locales/en.ts` & `zh.ts`**：新列的翻译 key

**`src/contexts/JobsContext.tsx`**：`deriveJobStatusFromStages` 中 `hr_chat` 引用更新

**数据兼容**：现有 stages 中 `category: 'hr_chat'` 在 `detectStageCategory` 中做回退映射，根据阶段在 pipeline 中的位置自动归类为 `hr_screen` 或 `hr_final`。

