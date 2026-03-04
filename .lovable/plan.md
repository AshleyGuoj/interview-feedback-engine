

## Two Fixes for Time Tracker

### Bug Fix: Day view shows no events

**Root cause**: In day view, `rangeStart` and `rangeEnd` are both `selectedDate` (e.g., `2026-03-04T14:30:00`). The `isWithinInterval` check requires `event.date >= start && event.date <= end`, so only events at that exact millisecond would match. Week/month work because `startOfWeek`/`endOfWeek` return proper day boundaries (00:00:00 / 23:59:59).

**Fix**: Import `startOfDay` and `endOfDay` from `date-fns`, and use them for the day view range:
```ts
if (viewMode === 'day') {
  return { rangeStart: startOfDay(selectedDate), rangeEnd: endOfDay(selectedDate) };
}
```

### New Category: 笔试 (Written Test)

Add `written_test` as a new `StageCategory`, separate from `assessment` (测评):

| Category | EN | ZH |
|---|---|---|
| `assessment` | Assessment | 测评 |
| `written_test` | Written Test | 笔试 |

**Changes across files:**

1. **`src/types/job.ts`**:
   - Add `'written_test'` to `StageCategory` union
   - Add entry in `STAGE_CATEGORY_CONFIG` (icon: `pen-line`, color: `indigo`)
   - Update `detectStageCategory`: keywords "笔试", "written test" → `written_test`; keep "OA", "assessment", "测评" → `assessment`

2. **`src/pages/TimeTracker.tsx`**:
   - Import `startOfDay`, `endOfDay` from `date-fns` (fixes the day view bug)
   - Update day range to use `startOfDay`/`endOfDay`
   - Add `'written_test'` to `EventType`, `EVENT_ICONS` (PenLine), `EVENT_COLORS` (indigo), `CATEGORY_ORDER`
   - Update `getEventTypeFromStage` to map `written_test` category

3. **`src/lib/i18n/locales/en.ts` & `zh.ts`**:
   - Add `type_written_test` / `section_written_test` keys
   - Add `stageCategory.written_test` label

4. **`src/components/jobs/StageEditor.tsx`**: Already reads from `STAGE_CATEGORY_CONFIG` dynamically, so it will pick up the new category automatically.

