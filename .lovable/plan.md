
# Archive Page Redesign: Career Growth Command Center

## Current State Analysis

| Page | Current Purpose | Key Features |
|------|----------------|--------------|
| **Analytics** | Active interview analysis | Job tree, Interview Analysis tab, Role Debrief tab, Career Growth tab |
| **Archive** | Empty placeholder | Shows "No Archived Jobs" - no functionality |

## Design Philosophy

The Archive page should transform from a "dead storage" concept into a **Career Retrospection Hub** — a place where users reflect on their journey, not just view closed applications.

### Key Insight
**Career Growth** fits better in Archive because:
1. It analyzes **historical data** across time (past vs current)
2. It generates **long-term insights** rather than active-interview analysis
3. Archive naturally represents "completed experiences" — perfect for retrospection

---

## Proposed Architecture

```text
+--------------------------------------------------+
|                  ARCHIVE PAGE                    |
|           "Career Growth & History"              |
+--------------------------------------------------+
|                                                  |
|  +---------------+  +-------------------------+  |
|  |  TAB BAR      |  |                         |  |
|  | [Growth] [History]                         |  |
|  +---------------+  |                         |  |
|                     |                         |  |
|  Growth Tab:        |   Detail Panel          |  |
|  - Career Coach     |   (Charts, Insights)    |  |
|  - Trend Charts     |                         |  |
|  - Competency Radar |                         |  |
|  - Priorities       |                         |  |
|                     |                         |  |
|  History Tab:       |                         |  |
|  - Closed Jobs List |                         |  |
|  - Searchable       |                         |  |
|  - Filterable       |                         |  |
+--------------------------------------------------+
```

---

## Detailed Changes

### 1. Move CareerGrowthPanel to Archive

**Files to modify:**
- `src/pages/Archive.tsx` — Complete redesign with tabs
- `src/pages/Analytics.tsx` — Remove Career Growth tab

### 2. New Archive Page Structure

The redesigned Archive page will have two tabs:

| Tab | Purpose | Content |
|-----|---------|---------|
| **Career Growth** | Long-term competency tracking | CareerGrowthPanel component (moved from Analytics) |
| **Closed Applications** | Historical job list | Filterable list of jobs with status='closed' |

### 3. Page Header Redesign

```text
+--------------------------------------------------+
| 🏆  Career Growth & Archive                       |
|     回顾你的职业成长轨迹，从过去的经验中汲取智慧    |
+--------------------------------------------------+
```

### 4. Update Analytics Page

Remove the Career Growth tab from Analytics, keeping only:
- **面试分析 (Interview Analysis)** — Round-level transcript analysis
- **Role Debrief** — Job-level summary (unlocked at ≥2 rounds per job)

This creates a cleaner separation:
- **Analytics** = Active interview intelligence
- **Archive** = Historical retrospection & growth tracking

### 5. Update Sidebar Navigation

Change the Archive label to better reflect its new purpose:
- Current: `Archive`
- New: `Growth & Archive` or keep as `Archive` with updated icon

---

## Implementation Summary

| File | Action | Details |
|------|--------|---------|
| `src/pages/Archive.tsx` | **Rewrite** | Add tabs, integrate CareerGrowthPanel, add closed jobs list |
| `src/pages/Analytics.tsx` | **Edit** | Remove Career Growth tab and related logic |
| `src/components/layout/Sidebar.tsx` | **Optional** | Consider updating icon or label |

---

## Technical Notes

### Data Access
- **Career Growth**: Uses `useJobs()` context — works with all jobs, filters analyzed rounds internally
- **Closed Applications**: Filter jobs where `status === 'closed'`

### Unlock Logic Preservation
Career Growth analysis will still require ≥2 analyzed interview rounds across all jobs (including both active and closed).

### UI Consistency
- Uses same design patterns as Analytics (Tabs, Cards, Charts)
- Maintains the "AI-native, calm" design language
