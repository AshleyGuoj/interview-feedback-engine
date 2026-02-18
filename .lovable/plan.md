

# Job Detail UI/UX Optimization Plan

## Issues Found

1. **Location Badge**: Still uses colorful semantic backgrounds (rose/blue/emerald/gray) -- already fixed in JobCard/DraggableJobCard but NOT in JobDetail.tsx (line 52-57)
2. **Star Rating**: Uses `fill-amber-400 text-amber-400` fluorescent yellow (line 749-755), same issue fixed in AddJobDialog but not here
3. **Page Title**: Company name uses `text-2xl` (line 615) instead of `text-[28px] sm:text-[32px]` to match Dashboard/JobBoard
4. **StageEditor Status Badges**: Uses emerald/blue/amber/gray semantic color backgrounds (lines 107-111), not brand-consistent
5. **StageStatus Offer Icon**: Uses `text-amber-500` / `text-amber-600` for offer and waiting states (lines 126-141), should use brand color
6. **Attachments Section**: Uses a full Card wrapper -- could be lighter to reduce card repetition on the page

## Changes

### File 1: `src/pages/JobDetail.tsx`

| Location | Current | Change To |
|----------|---------|-----------|
| locationColors (line 52-57) | rose/blue/emerald/gray per location | Unified `bg-muted text-muted-foreground` for all |
| Company name title (line 615) | `text-2xl` | `text-[28px] sm:text-[32px]` |
| Star rating (line 749-755) | `fill-amber-400 text-amber-400` | `fill-primary text-primary` |
| Attachments section (line 789-832) | Full Card wrapper | Open section with `border-l-2 border-l-primary/30 pl-5` to break card monotony |

### File 2: `src/components/jobs/StageEditor.tsx`

| Location | Current | Change To |
|----------|---------|-----------|
| Status badges (line 105-111) | `bg-emerald-100`, `bg-blue-100`, `bg-amber-100`, `bg-gray-100` with matching text colors | Unified: completed = `bg-primary/10 text-primary`, pending/scheduled = `bg-muted text-muted-foreground`, feedback = `bg-muted text-muted-foreground`, terminal = `bg-muted/50 text-muted-foreground/70` |

### File 3: `src/components/jobs/StageStatus.tsx`

| Location | Current | Change To |
|----------|---------|-----------|
| Offer icon/text (line 125-129) | `text-amber-500` / `text-amber-600 dark:text-amber-400` | `text-primary` / `text-primary font-semibold` |
| Waiting icon (line 139) | `text-amber-500` | `text-muted-foreground` |
| Completed text (line 116-117) | `text-chart-2` (both icon and text) | `text-primary` |

