

## Soften Progress Bar Color

### Goal
Make the progress bar less visually prominent by changing it from solid black (`bg-foreground`) to a subtle, semi-transparent gray.

### Change
**File: `src/components/jobs/PipelineStatus.tsx`** (line ~172)

Replace `indicatorClassName="bg-foreground"` with `indicatorClassName="bg-foreground/25"` -- this gives a light, transparent gray bar that blends in without drawing too much attention.

