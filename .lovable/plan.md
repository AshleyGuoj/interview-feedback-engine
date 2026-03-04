

## Add Stage Category to Interview Stages

### What Changes

Add a `category` field to each `InterviewStage` so every round is tagged with a standardized type, independent of its custom name.

### Stage Categories

| Category | EN | ZH |
|---|---|---|
| `assessment` | Assessment | 测评/笔试 |
| `interview` | Interview | 面试 |
| `hr_chat` | HR / Salary Talk | HR沟通/谈薪 |
| `offer_call` | Offer Call | Offer沟通 |
| `offer_received` | Offer Received | 收到Offer |

### Files to Change

**1. `src/types/job.ts`**
- Add `StageCategory` type: `'assessment' | 'interview' | 'hr_chat' | 'offer_call' | 'offer_received'`
- Add `STAGE_CATEGORY_CONFIG` with label/icon/color for each
- Add optional `category?: StageCategory` to `InterviewStage`
- Update `DEFAULT_STAGES` with default categories
- Add `detectStageCategory(name: string): StageCategory` helper using keyword matching

**2. `src/components/jobs/StageEditor.tsx`**
- Add category selector (small dropdown or chip row) when adding/editing a stage
- Auto-detect category from stage name, allow override
- Show category badge on each stage item in the list
- Update `STAGE_SUGGESTIONS` to include default categories

**3. `src/pages/TimeTracker.tsx`**
- Use `stage.category` directly when available, fall back to keyword matching for legacy data without categories

**4. `src/lib/i18n/locales/en.ts` & `zh.ts`**
- Add translation keys for each category label

### Auto-Detection Logic
- "OA", "assessment", "test", "take-home", "笔试", "测评", "coding challenge" → `assessment`
- "HR", "screen", "recruiter" → `hr_chat`
- "offer discussion", "offer call" → `offer_call`
- "offer received" → `offer_received`
- Everything else → `interview`

Users can always override the auto-detected category.

