

## 调整筛选逻辑：删除"全部"，"投递"作为默认全量筛选

用户希望：
- 删除"全部"filter，用"投递"替代（投递 = 显示该列所有卡片）
- 简历筛选/测评/笔试：只显示有对应 pending/active stage 的 job
- 即 filters 变为：`投递 | 简历筛选 | 测评 | 笔试`，其中"投递"等同于原来的"全部"

### 改动

**`src/types/job.ts`**：
1. 从 `ApplicationAssessmentFilter` 类型中删除 `'all'`
2. `APPLICATION_ASSESSMENT_FILTERS` 数组删除 `'all'`
3. `APPLICATION_ASSESSMENT_FILTER_CONFIG` 删除 `all` 条目
4. 默认 filter 改为 `'application'`

**`src/components/jobs/KanbanColumn.tsx`**：
- 默认 `activeFilter` 改为 `'application'`
- `filteredJobs` 逻辑：当 `activeFilter === 'application'` 时返回全部 jobs（等同原来的 all），其他 filter 按 `deriveApplicationSubCategory` 匹配

**`src/lib/i18n/locales/en.ts` & `zh.ts`**：
- 删除 `filterAll` 翻译 key

共改 4 个文件，逻辑简化。

