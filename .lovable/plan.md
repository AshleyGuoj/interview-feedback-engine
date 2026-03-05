

## Problem: Missing `completedAt` on Previously Completed Stages

The TCL Assessment was marked "completed" **before** the `completedAt` auto-timestamping code was added. The PATCH request confirms the stage has `"status": "completed"` but no `completedAt` field. The Time Tracker requires `completedAt` to show completion events.

### Root Cause
The `completedAt` logic in `performStageUpdate` only fires on **new** status transitions (`oldStatus !== 'completed'` → `'completed'`). Stages that were already completed before this feature was deployed never got a `completedAt` value.

### Fix: Backfill `completedAt` for Legacy Completed Stages

**File: `src/pages/TimeTracker.tsx`** — Update `extractEvents` to handle completed stages without `completedAt`:

- If `stage.status === 'completed'` but `stage.completedAt` is missing, fall back to `job.updatedAt` (or `job.createdAt`) as the completion date
- This ensures all historically completed stages appear in the Time Tracker immediately

**File: `src/pages/JobDetail.tsx`** — Add a one-time migration in `performStageUpdate`:

- When saving stages, scan all stages: if any has `status === 'completed'` but no `completedAt`, backfill with `job.updatedAt` or current time
- This gradually patches legacy data as users interact with their jobs

### Changes Summary
1. **TimeTracker.tsx**: In the completion event extraction block, if `stage.completedAt` is missing but status is `completed`, use `job.updatedAt` as fallback date
2. **JobDetail.tsx**: In `performStageUpdate`, iterate all stages and backfill missing `completedAt` for any already-completed stage

