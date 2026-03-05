

## 面试列添加筛选 pills + 各列卡片顶部对齐

### 问题
1. 投递/筛选列有 filter pills 占据高度，导致面试列的第一张卡片比投递列低
2. 用户希望面试列也有子筛选：一面、二面、HR面

### 改动

**`src/types/job.ts`**：
- 新增 `InterviewFilter` 类型：`'all_interview' | 'round_1' | 'round_2' | 'hr_round'`
- 新增 `INTERVIEW_FILTERS` 数组和 `INTERVIEW_FILTER_CONFIG` 配置
- 新增 `deriveInterviewSubCategory(job)` 函数，基于 frontier stage 判断当前面试轮次（一面/二面/HR面），逻辑类似 `deriveApplicationSubCategory`

**`src/components/jobs/KanbanColumn.tsx`**：
- 面试列也显示 filter pills（一面 | 二面 | HR面），默认选中"全部面试"显示所有卡片
- 没有 filter pills 的列（offer_call、offer_received、closed）在 header 下方加一个固定高度的 spacer（与 pills 等高），确保所有列的卡片容器顶部对齐

**`src/lib/i18n/locales/zh.ts` & `en.ts`**：
- 添加面试筛选翻译：一面/Round 1、二面/Round 2、HR面/HR Round、全部面试/All Interviews

### 对齐方案
给列 header 区域设置 `min-h` 或在无 pills 的列加占位元素，确保 cards container 起始位置一致。

