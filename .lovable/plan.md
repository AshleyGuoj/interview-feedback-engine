

## 删除"筛选"列

将 `screening` 列移除，把 `resume_screen` 和 `hr_screen` 合并到 `application_assessment` 列（改名为"投递/筛选/测评"），从 7 列变为 6 列。

### 改动

**`src/types/job.ts`**：
1. 从 `KanbanColumnType` 中删除 `'screening'`
2. `categoryToColumn` 中将 `resume_screen` 和 `hr_screen` 映射到 `application_assessment`
3. 从 `KANBAN_COLUMN_CONFIG` 中删除 `screening` 条目，更新 `application_assessment` 的 label
4. 从 `KANBAN_COLUMNS` 数组中删除 `'screening'`

**`src/lib/i18n/locales/en.ts` & `zh.ts`**：
- 删除 `colScreening` 翻译 key
- 更新 `colApplicationAssessment` 为 "Applied / Screening" / "投递/筛选"

共改 3 个文件，纯删除+重命名，无逻辑变化。

