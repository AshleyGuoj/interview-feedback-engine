
# 功能：海报生成前手动标记敏感内容，打上马赛克

## 核心设计思路

由于以下原因，**手动选择（用户点击标记）** 是最合适的方案：
- AI 自动检测哪些是"敏感信息"逻辑复杂，且容易误判
- 每个人对"敏感"的定义不同（有人在乎公司名，有人在乎项目细节，有人在乎具体数字）
- 用户自己点击一下要遮挡的内容，直接、准确、可控

**马赛克实现方式**：在海报 DOM 中，被标记的文字替换为一段灰色模糊矩形（`filter: blur(6px)` + 灰色背景），`html-to-image` 会把 CSS blur 完整捕获到图片中，效果与微信截图打码一致。

## 用户交互流程

```text
打开「生成海报」弹窗
        ↓
弹窗右上角出现「🛡️ 隐私模式」切换开关
        ↓
开启后，海报预览中：
- 每道题目的题目文字旁出现「点击遮挡」提示
- 复盘各区块（总体评价/表现良好/可改进/核心收获/面试官风格/公司洞察）整块可点击
        ↓
用户点击想遮挡的内容 → 该块变为模糊马赛克效果
再次点击 → 取消遮挡（切换）
        ↓
确认无误后，点击下载/复制 → 马赛克会渲染进图片
```

## 可以遮挡的颗粒度

| 内容块 | 遮挡单位 |
|---|---|
| 面试题目 | 每道题的题目文字（独立，可单独遮挡） |
| 总体评价 | 整段文字 |
| 表现良好 | 整个列表 |
| 可改进之处 | 整个列表 |
| 核心收获 | 整个列表 |
| 面试官风格 | 整段文字 |
| 公司洞察 | 整段文字 |

## 技术实现

### 1. 状态管理（新增到 `InterviewPosterModal`）

```typescript
// 隐私模式开关
const [privacyMode, setPrivacyMode] = useState(false);

// 被标记为敏感的内容 ID 集合
// 格式：'question-0', 'question-1', 'reflection-summary', 
//        'reflection-well', 'reflection-improve', 
//        'reflection-takeaways', 'reflection-vibe', 'reflection-insights'
const [redactedItems, setRedactedItems] = useState<Set<string>>(new Set());

const toggleRedact = (id: string) => {
  setRedactedItems(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};
```

### 2. 将状态传入 `PosterContent`

```typescript
// PosterContent props 增加：
interface PosterContentProps {
  job: Job;
  stage: InterviewStage;
  t: (key: string) => string;
  privacyMode: boolean;
  redactedItems: Set<string>;
  onToggleRedact: (id: string) => void;
}
```

### 3. 马赛克渲染（CSS blur + 灰块）

```typescript
// 工具函数：生成遮挡样式
function redactStyle(isRedacted: boolean, isEditing: boolean) {
  return isRedacted
    ? {
        filter: 'blur(6px)',
        backgroundColor: '#d1d5db',
        borderRadius: '4px',
        userSelect: 'none' as const,
        cursor: isEditing ? 'pointer' : 'default',
      }
    : isEditing
    ? { cursor: 'pointer', outline: '2px dashed #6366f1', outlineOffset: '2px', borderRadius: '4px' }
    : {};
}
```

### 4. 隐私模式 UI（弹窗顶部新增切换条）

在按钮行和预览之间加一条提示栏：

```
┌─────────────────────────────────────────────────────┐
│  🛡️ 隐私模式   ●  开启后，点击内容块可打上马赛克    │
│  [已遮挡 3 块内容，将在图片中隐藏]                  │
└─────────────────────────────────────────────────────┘
```

- 用 `Switch` 组件控制隐私模式开/关
- 开启后预览区有虚线边框提示可点击区域
- 被遮挡的块显示 blur 效果
- 计数显示「已遮挡 N 块内容」

### 5. 视觉效果预览

```
隐私模式开启时，题目区域样式：

Q1  ████████████████████   ← 模糊（被标记）
    [行为题] [表现良好]

Q2  金融客户具体的工作流...  ← 清晰（未标记）
    [技术题] [有待提升]

```

## 需要修改的文件

| 文件 | 改动内容 |
|---|---|
| `src/components/analytics/InterviewPosterModal.tsx` | 新增隐私模式状态；`PosterContent` 接收 `redactedItems` prop；各内容块包裹可点击遮挡层；新增隐私模式控制 UI |

## 改动范围

- 纯前端改动，无需后端
- 不影响数据存储（遮挡状态只在弹窗内存中，关闭弹窗后重置）
- 不影响现有下载/复制/分割功能（遮挡效果跟随 DOM 一起被捕获进图片）
- CSS `filter: blur()` 被 `html-to-image` 完整支持，效果与预览一致
