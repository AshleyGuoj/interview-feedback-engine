
# Two Fixes: Smart Image Slicing + Floating Selection Toolbar

## Fix 1: Selection Toolbar Follows the Mouse

### The Problem
The toolbar is positioned using `position: absolute` inside the scrollable preview wrapper, with coordinates calculated from `range.getBoundingClientRect()` minus `wrapperRef.getBoundingClientRect()`. When the user scrolls down inside the preview, the toolbar appears far off-screen at the top of the scroll container.

### The Fix
Switch from `position: absolute` (scroll-relative) to `position: fixed` (viewport-relative). The toolbar will be rendered outside the scroll container using a React portal attached to `document.body`, with coordinates taken directly from `range.getBoundingClientRect()` — which always returns viewport-relative coordinates regardless of scroll position.

**Before:**
```
previewWrapperRef (overflow-y: auto)
  └── toolbar (position: absolute, top: rect.top - wrapperRect.top - 44)
         ← disappears when scrolled
```

**After:**
```
document.body
  └── toolbar (position: fixed, top: rect.top - 44)
         ← always floats near the selection
```

The `SelectionToolbarState` will store `clientX` / `clientY` (viewport coords) instead of wrapper-relative coords. The toolbar renders via `ReactDOM.createPortal` into `document.body`.

---

## Fix 2: Smart Slicing — No Mid-Sentence Cuts

### The Problem
The current slicing logic cuts the full poster PNG at exact pixel multiples of `pageHeight`. Since the image is a flat bitmap at this point, there is no semantic knowledge of where paragraphs end, so sentences are cut in the middle.

### The Fix: Content-Aware Cut Points

Before flattening the DOM to PNG, we read the **bounding boxes of natural break elements** from the live DOM to build a list of "safe cut lines". Then, when slicing the PNG, each page boundary is snapped to the nearest safe cut line that falls below the desired cut position.

#### Step-by-step:

**Step 1 — Collect safe cut lines from the DOM**

After `setIsCapturing(true)` and the 80ms paint delay (before `toPng`), we scan the `posterRef` for block-level elements: each question card, each reflection section, and the header/footer. We record the bottom Y of each block, multiplied by `pixelRatio: 2` to match the PNG's pixel coordinate space.

```typescript
const collectSafeCuts = (el: HTMLDivElement, pixelRatio: number): number[] => {
  const containerRect = el.getBoundingClientRect();
  const selectors = [
    '[data-slice-block]',   // we add this attribute to each major block
  ];
  const cuts: number[] = [];
  el.querySelectorAll('[data-slice-block]').forEach(block => {
    const r = block.getBoundingClientRect();
    // bottom of this block, relative to container top, scaled to PNG pixels
    const bottomPx = (r.bottom - containerRect.top) * pixelRatio;
    cuts.push(Math.floor(bottomPx));
  });
  return cuts.sort((a, b) => a - b);
};
```

**Step 2 — Add `data-slice-block` to each major block in `PosterContent`**

We add `data-slice-block="true"` to each top-level content block:
- The header `<div>`
- Each question card `<div>`
- Each reflection section div (summary, whatWentWell, whatCouldImprove, keyTakeaways, interviewerVibe, companyInsights)
- The watermark footer `<div>`

**Step 3 — Snap cut position to nearest safe cut**

```typescript
const snapToCut = (idealY: number, safeCuts: number[], maxOverlap: number): number => {
  // Find the largest safe cut that is <= idealY
  // If none, fall back to idealY (plain cut)
  const below = safeCuts.filter(c => c <= idealY);
  if (below.length === 0) return idealY;
  const best = below[below.length - 1];
  // If the gap is too large (would leave huge blank), fall back
  if (idealY - best > maxOverlap) return idealY;
  return best;
};
```

The `maxOverlap` is set to `pageHeight * 0.25` — if the nearest safe break is more than 25% above where we'd normally cut, we accept the plain cut rather than producing a very short page.

**Step 4 — Rebuild the slicing loop with variable page heights**

Instead of fixed `pageHeight` per slice, we calculate each page's actual height:

```typescript
let sliceY = 0;
let page = 0;
while (sliceY < fullHeight) {
  const idealEnd = sliceY + pageHeight;
  const snappedEnd = snapToCut(idealEnd, safeCuts, pageHeight * 0.25);
  const actualEnd = Math.min(snappedEnd, fullHeight);
  // draw canvas from sliceY to actualEnd
  sliceY = actualEnd;
  page++;
}
```

This means pages may be slightly shorter or taller than the ideal 3:4 ratio, but they will never cut mid-sentence.

---

## Files to Modify

| File | Changes |
|---|---|
| `src/components/analytics/InterviewPosterModal.tsx` | Fix 1: Portal-based toolbar with `position: fixed`. Fix 2: `data-slice-block` on each block; `collectSafeCuts()` helper; smart slicing loop |

## Scope

- Pure frontend, no backend changes
- Both fixes are isolated to `InterviewPosterModal.tsx`
- The `isCapturing` flow is unchanged; safe cuts are collected during the existing 80ms paint window
- All three download paths (长图, 小红书版, 复制) still share `generateImage()`; only the slicing loop in `handleDownloadSliced` is updated
