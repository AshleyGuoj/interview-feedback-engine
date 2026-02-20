
# 修复：下载图片时去除隐私模式 UI 装饰元素

## 问题根因分析

`html-to-image` 的 `toPng()` 直接截取 `posterRef` 所指向的整个 DOM，当前 DOM 中混杂了两类元素：

**应该出现在图片里的（内容）**
- 模糊的文字 span（`filter: blur(6px)` + 灰色背景）✅ 已正确截入
- 整块模糊的卡片效果 ✅ 已正确截入

**不应该出现在图片里的（交互 UI）**
- "整块遮挡" 小按钮（`BlockRedactHint`）
- "点击撤销遮挡" 文字（`UnredactHint`）
- 所有区块的虚线外框（`outline: 1.5px dashed #a5b4fc`）
- 浮动的「🛡️ 打上马赛克」工具栏（已在 `previewWrapperRef` 层，不在 `posterRef` 内，问题较小）

## 修复方案：传入"下载模式"标志

在 `PosterContent` 组件 props 中新增一个 `isCapturing: boolean` 标志。调用 `generateImage()` 时，先将 `isCapturing` 设为 `true`，触发重新渲染，让 DOM 去掉所有交互 UI 装饰，然后执行截图，截图完成后再还原。

### 状态流动

```text
用户点击「下载」按钮
      ↓
setIsCapturing(true)   ← 告知 PosterContent 进入截图模式
      ↓
PosterContent 重新渲染：
  · 去掉所有虚线 outline
  · 隐藏 BlockRedactHint（"整块遮挡"）
  · 隐藏 UnredactHint（"点击撤销遮挡"）
  · 保留 blur 效果（文字级 + 整块）
      ↓
await new Promise(r => setTimeout(r, 50))  ← 等 DOM 更新
      ↓
toPng(posterRef.current) → 截图，UI 干净
      ↓
setIsCapturing(false)  ← 恢复预览 UI
      ↓
下载/切割/复制
```

## 具体改动（仅修改 `InterviewPosterModal.tsx`）

### 1. 新增 `isCapturing` state

```typescript
const [isCapturing, setIsCapturing] = useState(false);
```

### 2. `generateImage()` 改为先设置标志

```typescript
const generateImage = async (): Promise<string> => {
  if (!posterRef.current) throw new Error('Poster ref not found');
  setIsCapturing(true);
  // 等 React 渲染完成（下一个 paint）
  await new Promise(r => setTimeout(r, 80));
  try {
    return await toPng(posterRef.current, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  } finally {
    setIsCapturing(false);
  }
};
```

### 3. `PosterContent` 接收 `isCapturing` prop

```typescript
interface PosterContentProps {
  // ...现有 props
  isCapturing: boolean;   // 新增
}
```

### 4. 条件渲染——截图时隐藏 UI 元素

所有使用 `BlockRedactHint` 和 `UnredactHint` 的地方改为：

```tsx
{privacyMode && !isRedacted && !isCapturing && <BlockRedactHint onClick={...} />}
{isRedacted && !isCapturing && <UnredactHint onClick={...} />}
```

所有区块的虚线外框样式改为：

```typescript
...(privacyMode && !isRedacted && !isCapturing
  ? { outline: '1.5px dashed #a5b4fc', outlineOffset: '1px' }
  : {})
```

### 5. 整块遮挡卡片的"点击撤销"层（题目卡片内部）

题目卡片有一个单独的 `isRedacted` 覆盖层（lines 695–708），截图时整块遮挡依然生效（灰色 + blur），但覆盖层本身（含 `cursor: pointer` 和"点击撤销遮挡"文字）在 `isCapturing` 时不渲染：

```tsx
{isRedacted && !isCapturing && (
  <div onClick={...} style={{ position: 'absolute', inset: 0, ... cursor: 'pointer' }}>
    ...
  </div>
)}
// 截图时，用一个纯样式层代替（只保留视觉 blur，不带文字）
{isRedacted && isCapturing && (
  <div style={{
    position: 'absolute', inset: 0, borderRadius: '10px',
    backgroundColor: '#d1d5db', filter: 'blur(8px)',
    zIndex: 2,
  }} />
)}
```

## 改动涉及范围

| 元素 | 截图时的处理 |
|---|---|
| "整块遮挡" 小按钮（BlockRedactHint） | 不渲染 |
| "点击撤销遮挡" 覆盖层（UnredactHint） | 不渲染 |
| 各区块虚线 outline | 移除 |
| 文字级 blur span | 保留（正确效果）|
| 整块卡片灰色 blur | 保留，但无交互文字/cursor |
| 浮动「打上马赛克」工具栏 | 在 previewWrapperRef 层，不在 posterRef 内，不影响截图 |

## 需要修改的文件

| 文件 | 改动量 |
|---|---|
| `src/components/analytics/InterviewPosterModal.tsx` | 新增 `isCapturing` state；更新 `generateImage()`；`PosterContent` props 增加 `isCapturing`；7 处条件渲染修改 |

## 改动范围

- 纯前端，无 API 调用
- 不影响数据存储
- 三个下载路径（长图、小红书版、复制）均走同一个 `generateImage()` 函数，统一修复
- 用户预览体验不变，只有截图的瞬间（80ms）DOM 会更新
