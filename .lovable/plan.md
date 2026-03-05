

## 为"投递/筛选"列添加子分类筛选

在 `application_assessment` 列的列头添加筛选 pills，允许用户按 4 个子分类过滤卡片：投递、简历筛选、测评、笔试。

### 改动

**`src/components/jobs/KanbanColumn.tsx`**：
- 当 `column === 'application_assessment'` 时，在列头下方渲染一组 filter pills（全部 / 投递 / 简历筛选 / 测评 / 笔试）
- 维护 `activeFilter` state，默认 `'all'`
- 根据 filter 对 jobs 做二次过滤：取每个 job 的最高优先级活跃 category，与 filter 匹配
- 其他列不受影响

**`src/components/jobs/KanbanBoard.tsx`**：
- 传递每个 job 的 derived category 给 KanbanColumn，供筛选使用（或在 KanbanColumn 内部自行计算）

**`src/types/job.ts`**：
- 导出一个 `deriveJobStageCategory(job)` 辅助函数，返回 job 在 application_assessment 列中的具体 category（application / resume_screen / assessment / written_test），供 filter 使用

**`src/lib/i18n/locales/zh.ts` & `en.ts`**：
- 添加 filter label 翻译 keys

### 交互设计
- Filter pills 使用紧凑的 chip 样式，放在列标题下方
- 默认选中"全部"，点击切换单选
- 筛选后计数随之更新
- 样式与 Analytics 页面的 filter pills 一致（`bg-muted/50` 背景 + active 时 `bg-background shadow-sm`）

