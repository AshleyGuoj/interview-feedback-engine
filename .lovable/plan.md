

## 添加「投递」和「简历筛选」Category，完善 Time Tracker 分类

### 当前情况

**Category 体系** (`StageCategory`): `assessment | written_test | interview | hr_chat | offer_call | offer_received`
- 没有 `application`（投递）category
- 没有 `resume_screen`（简历筛选）category
- "Applied" 阶段被临时设为 `hr_chat`，不太对

**Time Tracker EventType**: `applied | interview | assessment | written_test`
- `applied` 事件不是基于 category，而是直接从 `job.createdAt` 硬编码生成的（每创建一个 job 就自动产生一个 applied 事件）
- 所以"已投递"的判断逻辑 = 创建了 Job 就等于已投递

### 改动计划

**1. `src/types/job.ts`** — 扩展 StageCategory

```ts
export type StageCategory = 'application' | 'resume_screen' | 'assessment' | 'written_test' | 'interview' | 'hr_chat' | 'offer_call' | 'offer_received';
```

- 添加 `application`（投递）和 `resume_screen`（简历筛选）
- 更新 `STAGE_CATEGORY_CONFIG` 加入对应显示配置
- 更新 `detectStageCategory` 加入关键词匹配（`applied`, `投递` → `application`；`简历`, `resume screen` → `resume_screen`）
- `DEFAULT_STAGES` 中 "Applied" 改为 `category: 'application'`

**2. `src/pages/TimeTracker.tsx`** — 扩展 EventType

- `EventType` 增加 `resume_screen`
- `getEventTypeFromStage`: `application` category 映射到 `applied` EventType；`resume_screen` 映射到新的 `resume_screen`
- `EVENT_ICONS` / `EVENT_COLORS` 增加 `resume_screen` 配置
- `CATEGORY_ORDER` 更新为 `['applied', 'resume_screen', 'assessment', 'written_test', 'interview']`

**3. `src/lib/i18n/locales/en.ts` & `zh.ts`** — 添加翻译

- `timeTracker.type_resume_screen`: "Resume Screen" / "简历筛选"
- `timeTracker.section_resume_screen`: "Resume Screening" / "简历筛选"

### 回答你的问题

目前「已投递」的判断方式：**创建 Job 就自动生成一个 applied 事件**，用 `job.createdAt` 作为日期。它不依赖任何 stage 的 category，是硬编码在 `extractEvents` 里的。这个逻辑保持不变，因为投递确实等于创建 Job。

