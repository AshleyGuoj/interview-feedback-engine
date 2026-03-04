

## Time Tracker Refinement: Cleaner Event Categories

### Problem
Currently the page shows three event types: 投递, 面试, and 动态 (status_change). The "动态" events are noisy — they duplicate information already visible from the applied/interview events (e.g., "Application submitted for X" is redundant with the 投递 event).

### Proposed Solution

**Remove `status_change` entirely.** Only keep events derived from job data itself:

1. **投递 (Applied)** — from `job.createdAt`, one per job
2. **面试 (Interview)** — stages whose name matches interview patterns (HR Screen, Round 1, Final Round, etc.)
3. **测评 (Assessment)** — stages whose name matches assessment patterns (Assessment, Take-home, OA, etc.)

### How to Distinguish Interview vs Assessment

Use stage name pattern matching in `extractEvents()`:

```text
Assessment keywords: assessment, take-home, oa, 测评, 笔试, online assessment
Everything else with a scheduled time → Interview
```

### Changes

**`src/pages/TimeTracker.tsx`**:
- Change `EventType` from `'applied' | 'interview' | 'status_change'` to `'applied' | 'interview' | 'assessment'`
- Remove all activity-related code (no more `useActivities()` import)
- Add stage name classification logic to split interview vs assessment
- Update icons: Assessment gets `ClipboardCheck`, Interview keeps `Mic`
- Update filter badges to show: 全部 / 投递 / 面试 / 测评

**`src/lib/i18n/locales/en.ts` & `zh.ts`**:
- Replace `type_status_change` with `type_assessment`
- EN: "Assessment", ZH: "测评"

### Event Grouping Per Day

Within each date group, events will be visually ordered:
1. 投递 items first (blue `FileText` icon)
2. 面试 items (amber `Mic` icon)  
3. 测评 items (purple `ClipboardCheck` icon)

This matches the screenshot reference but removes the redundant 动态 rows, making each day's view clean and actionable.

