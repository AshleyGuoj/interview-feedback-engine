

## Add Progress Bar to All Job Cards

### Goal
Show a stage progress bar on every job card -- not just rejected/closed ones. The bar visually indicates how far a candidate has progressed through the interview pipeline (e.g., "3 / 5 stages").

### What You'll See
Every job card will display a thin progress bar below the status line showing:
- The number of completed/current stages vs. total stages
- A color that matches the job's current state (blue for active, amber for awaiting decision, green for offer, red for rejected, etc.)
- A small text label like "Stage 3 / 5" beneath the bar

### How It Works

The progress calculation uses the pipeline resolver's existing data:
- **Total stages**: number of stages in the active pipeline
- **Current position**: determined by the resolved state type:
  - `applied`: 0 / total
  - `next_interview`: index of the active stage / total
  - `awaiting_decision`: index of the last completed stage + 1 / total
  - `rejected`: stageIndex + 1 / total (already exists)
  - `offer`: total / total (100%)
  - `withdrawn`: index of withdrawn stage / total
  - `on_hold`: index of on-hold stage / total

### Technical Details

**File: `src/components/jobs/PipelineStatus.tsx`**

1. Expand `getProgressInfo()` to compute progress for ALL state types (not just `rejected`).
2. Move the progress bar rendering out of the `rejected`-only block so it renders for every state.
3. Use state-appropriate colors for the progress bar indicator (via a CSS class or inline style that maps to `displayConfig.color`).

**File: `src/components/ui/progress.tsx`**

4. Add support for a custom indicator color class (e.g., via a prop or className override on the indicator) so the bar can be blue, amber, green, red, etc. depending on state.

**File: `src/lib/pipeline-resolver.ts`**

5. Add a `currentStageIndex` field to all `ResolvedPipelineState` variants (or to `PipelineResolution`) so the progress calculation is centralized and doesn't need to be re-derived in the UI component.

**i18n**: The existing `jobs.completedStages` key ("Completed {{completed}} / {{total}} stages") will be reused. A new key like `jobs.stageProgress` ("Stage {{current}} / {{total}}") will be added for active (non-terminal) states to differentiate the label from the "Completed X / Y" wording used for closed jobs.

**Summary of changes**:
- `src/lib/pipeline-resolver.ts` -- add `currentStageIndex` and `totalStages` to `PipelineResolution` for all states
- `src/components/ui/progress.tsx` -- accept optional `indicatorClassName` prop for custom bar color
- `src/components/jobs/PipelineStatus.tsx` -- compute and render progress bar for all state types with state-matched colors
- `src/lib/i18n/locales/en.ts` and `zh.ts` -- add `jobs.stageProgress` key
