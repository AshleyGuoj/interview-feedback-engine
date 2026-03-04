

## Time Tracker — Daily Activity Log

### What It Does
A new `/time-tracker` page that displays a **date-grouped vertical timeline** of all your job search activities. For each day, you see what you applied to, which interviews you had, and what stages progressed — with job links clearly visible.

### Data Source (No Schema Changes Needed)
The existing data already contains the timestamps we need:
- **Job applications**: `job.createdAt` (when the job was added = applied date)
- **Interview stages**: `stage.scheduledTime`, `stage.date`, or `stage.deadline` on each `InterviewStage`
- **Activities**: `recent_activities` table with `created_at` timestamps

We aggregate events from all three sources, group by calendar date, and render them.

### UI Design

```text
┌─────────────────────────────────────────────┐
│  Time Tracker                               │
│  Your daily job search activity log         │
│                                             │
│  ◀  March 2026  ▶       [This Week ▾]       │
│                                             │
│  ── March 4, 2026 (Today) ─────────────     │
│                                             │
│  📄 Applied: Google — PM L5        🔗       │
│  📄 Applied: Meta — Product Analyst 🔗      │
│  🎤 Interview: ByteDance — Round 2          │
│     10:00 AM (BJ) / 9:00 PM (ET)           │
│  📝 Assessment: Stripe — Take-home          │
│                                             │
│  ── March 3, 2026 ─────────────────────     │
│                                             │
│  📄 Applied: Amazon — Sr. PM       🔗       │
│  ⏳ Feedback: Airbnb — HR Screen            │
│                                             │
│  ── March 1, 2026 ─────────────────────     │
│  ...                                        │
└─────────────────────────────────────────────┘
```

### Implementation Plan

1. **Create `/time-tracker` route and page** (`src/pages/TimeTracker.tsx`)
   - Extract events from `jobs` (createdAt for applications) and `stages` (scheduledTime/date for interviews)
   - Group all events by calendar date using `date-fns` `format()`
   - Sort dates descending (newest first), events within each date by time

2. **Event types to extract**:
   - `applied` — from `job.createdAt`, show company + role + job link
   - `interview` — from stages with `scheduledTime` or `date`, show company + stage name + dual timezone
   - `status_change` — from `recent_activities`, show activity message
   - Each event card shows a clickable link to the job detail page, and the external job link (🔗) if available

3. **Filter controls**:
   - Month navigator (prev/next) 
   - Quick filter: "This Week" / "This Month" / "All"
   - Optional type filter chips: Applied / Interview / Assessment / All

4. **Add sidebar navigation entry** — Clock icon, between Timeline and Analytics

5. **Add i18n keys** for both EN and ZH

### Technical Notes
- Pure frontend computation from existing `useJobs()` data + `useActivities()` — no new database tables or Edge Functions needed
- Uses `useMemo` to efficiently compute the grouped timeline
- Reuses `formatDualTimezone()` for interview time display
- Each event row is clickable → navigates to `/jobs/:id`

