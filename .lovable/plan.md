

## Time Tracker Redesign: Daily Page View

### Current Problem
The timeline currently shows all dates stacked vertically in a long scroll. The user wants a **single-day focused view** where today's activities are front and center, with events clearly separated by category.

### Proposed Design

```text
┌─────────────────────────────────────────────────┐
│  Time Tracker                                   │
│                                                 │
│  ◀  March 4, 2026 (Today)  ▶   [Week] [Month]  │
│                                                 │
│  ── 投递 Applied ──────────────────────────────  │
│  📄 Google — PM L5                         🔗   │
│  📄 Meta — Product Analyst                 🔗   │
│                                                 │
│  ── 测评 Assessment ──────────────────────────   │
│  📝 Stripe — Take-home Challenge                │
│                                                 │
│  ── 面试 Interview ──────────────────────────    │
│  🎤 ByteDance — Round 2                         │
│     10:00 AM (BJ) / 9:00 PM (ET)               │
│                                                 │
│  (empty category simply hidden)                 │
└─────────────────────────────────────────────────┘
```

### Key Changes to `TimeTracker.tsx`

1. **Single-day focus**: Replace the "show all dates" layout with a **date navigator** (◀ prev day / next day ▶). Default to today.

2. **Category sections**: Within the selected day, group events into three collapsible sections — Applied, Assessment, Interview — each with its own header and icon. Empty sections are hidden.

3. **Week/Month toggle**: When user selects "Week" or "Month", switch to a **multi-day view** showing each day as a card/section (similar to current layout but with category grouping within each day).

4. **Navigation**: 
   - Day mode: ◀/▶ arrows step by 1 day, "Today" button jumps back
   - Week mode: ◀/▶ step by 1 week
   - Month mode: ◀/▶ step by 1 month (existing behavior)

5. **Visual polish**: Add event count badges next to each category header (e.g., "投递 (3)"), and show a summary line at the top like "3 applications · 1 interview · 1 assessment".

### i18n
Add keys for category section headers and the daily summary line in both EN and ZH.

