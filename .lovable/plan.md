

## Bug: "Applied" Stage Completion Events Miscategorized as "面试"

### Root Cause

Two issues combine to create this bug:

1. **`DEFAULT_STAGES`** sets the "Applied" stage with `category: 'interview'` — this is incorrect
2. **Completion event extraction** generates a completion event for every `completed` stage, including "Applied". Since the Applied stage has `category: 'interview'`, `getEventTypeFromStage` returns `'interview'`, so these events land under the "面试" section

The screenshot shows 6 items under "面试" that are all `Applied (已完成)` — these are completion events from the Applied stage being misclassified.

### Fix

**1. `src/types/job.ts`** — Change the default "Applied" stage category from `'interview'` to something more appropriate. Actually, "Applied" isn't an interview/assessment/etc — it represents the application itself. Best approach: skip completion events for it entirely.

**2. `src/pages/TimeTracker.tsx`** — In the completion event block, skip stages whose name matches "Applied" (case-insensitive, including Chinese variants). The application event is already captured by the dedicated `applied` event at line 53-62 — generating a second completion event for it is redundant and creates the duplicates seen in the screenshot.

```ts
// Skip completion events for "Applied" stages — already covered by the applied event
if (stage.status === 'completed') {
  const lowerName = stage.name.toLowerCase();
  if (lowerName === 'applied' || lowerName === '投递') {
    continue; // skip — redundant with the applied event
  }
  // ... rest of completion event logic
}
```

This is a minimal, targeted fix: only 2 lines added to filter out the redundant events.

