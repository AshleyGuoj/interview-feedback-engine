

## Capture Completion Events in Time Tracker

### Problem
The Time Tracker only shows events with a `scheduledTime`, `date`, or `deadline`. When you mark a stage as "completed" in Job Detail, there's no completion timestamp stored on the stage, so it never appears in the Time Tracker.

### Solution: Add `completedAt` to InterviewStage

When a stage status changes to `completed`, record `completedAt: new Date().toISOString()` on the stage. Then the Time Tracker extracts **two types of events per stage**:

1. **Scheduled event** (existing) — shown on the day it was scheduled
2. **Completed event** (new) — shown on the day it was marked complete, with a "✓ Completed" visual treatment

```text
── 测评 Assessment ──────────────────────
  ✓ Stripe — Take-home Challenge (已完成)     ← completedAt = today
  🎤 ByteDance — Round 2                      ← scheduledTime = today
```

### Files to Change

**1. `src/types/job.ts`**
- Add `completedAt?: string` to `InterviewStage` interface

**2. `src/pages/JobDetail.tsx`**
- In the stage update handler (~line 230), when `updates.status === 'completed'`, auto-set `completedAt: new Date().toISOString()` on the stage

**3. `src/pages/TimeTracker.tsx`**
- Update `extractEvents` to also emit a completion event for stages where `stage.status === 'completed'` and `stage.completedAt` exists
- These events use the stage's category but get a distinct visual: a check-mark icon overlay and "(已完成)" / "(Completed)" suffix in the label
- Completion events are grouped under their original category (e.g., assessment completion shows under "测评")

**4. `src/lib/i18n/locales/en.ts` & `zh.ts`**
- Add `timeTracker.completed_suffix`: "Completed" / "已完成"

### Event Extraction Logic (updated)

For each stage:
- If `scheduledTime || date || deadline` exists → emit scheduled event (as before)
- If `status === 'completed' && completedAt` exists → emit completion event dated at `completedAt`
- Both can coexist (scheduled on Monday, completed on Wednesday → appears on both days)

### Visual Treatment for Completion Events
- Same category icon but with a subtle check overlay or green tint
- Label: `Company — Stage Name (已完成)`
- Badge: category type + "✓"

