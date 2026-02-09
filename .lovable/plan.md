

## Animated Loading Experience for Career Signal Timeline

### Goal
Replace the current plain skeleton loading state with an engaging, multi-step animated loading experience -- similar to the existing `LoadingState` component used on the Interview Analysis page.

### What You'll See
When the Timeline page loads and the AI is analyzing your career signals, instead of grey skeleton blocks, you'll see:
- A glowing animated icon at the top
- A series of loading steps that progress one by one (e.g., "Scanning your interview history...", "Detecting career signals...", "Mapping momentum trends...", "Composing coach insights...")
- A smooth progress bar that fills as steps advance
- A helpful message like "This usually takes 10-20 seconds"

### Technical Details

**New component**: `src/components/timeline/TimelineLoadingState.tsx`
- Modeled after the existing `src/components/interview/LoadingState.tsx` pattern
- 4 animated loading steps with relevant icons (e.g., `FileSearch`, `Brain`, `TrendingUp`, `Sparkles`)
- Step rotation every ~2.5 seconds via `useEffect` interval
- Gradient progress bar that advances with each step
- Supports i18n translations

**Modified files**:
1. `src/components/timeline/CareerSignalTimeline.tsx` -- replace the skeleton-based loading block (lines ~148-160) with the new `TimelineLoadingState` component
2. `src/lib/i18n/locales/en.ts` -- add loading step strings under `timeline`
3. `src/lib/i18n/locales/zh.ts` -- add Chinese translations for the same keys

