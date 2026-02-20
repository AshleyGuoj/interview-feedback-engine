
# 新功能：一键生成面试分析海报（小红书分享）

## 功能定位

在保存结果后，用户点击"生成海报"按钮，弹出一个预览弹窗，海报内容与当前已保存的分析页面保持一致，但问题卡片**不展开**（只显示问题文本 + 类别 badge + 表现评级），面试复盘部分也完整呈现。用户可以截图或直接下载 PNG 分享到小红书。

---

## 技术实现建议

**生成方案：用 `html2canvas`（或 `dom-to-image`）把 DOM 转成图片**

这是最适合这个场景的方案，原因：
- 完全复用现有的 Tailwind CSS 样式，不需要重新绘制 UI，视觉 100% 一致
- 不需要后端，纯前端即可完成
- 对于小红书尺寸（竖版 3:4），支持生成长图

我的建议是使用 **`html-to-image`** 库（比 html2canvas 更稳定、支持 Tailwind、维护更活跃）。

---

## 海报内容规划

海报 = 保存后的分析视图，但做以下简化：

| 区块 | 海报显示内容 |
|---|---|
| 顶部 Header | 公司名 + 岗位名 + 面试轮次 + 日期 |
| 问题列表 | Q1 问题文本 + 类别 + 表现评级（**不展开**，无答案摘要/面试重点/原因） |
| 面试复盘 | 总体评价 + 表现好的地方 + 可改进之处 + 核心收获 + 面试官风格 + 公司洞察（完整展示） |
| 底部水印 | OfferMind 品牌 Logo + 小字提示 |

**海报尺寸**：宽 390px，高度自适应内容（适合小红书竖版比例 3:4 ~ 9:16）

---

## 需要新增的文件

### 1. `src/components/analytics/InterviewPosterModal.tsx`（新建）

一个弹窗组件，包含：
- `PosterContent` 子组件：渲染海报的实际 DOM（白色背景，固定宽度 390px，padding 内边距，完整海报布局）
- "下载图片"按钮：调用 `html-to-image` 的 `toPng()` 把 `PosterContent` 转成 PNG 并触发下载
- "复制图片"按钮（可选增强）：使用 Clipboard API 直接复制图片到剪贴板

### 2. 在 `package.json` 新增依赖：`html-to-image`

---

## 需要修改的文件

### `src/components/analytics/AnalysisDetailPanel.tsx`

在已保存视图（`hasExistingAnalysis && !result && !showReanalyzeInput` 分支，lines 188-295）的底部"重新分析"按钮旁边，新增一个**"生成海报"按钮**：

```tsx
// 在 "重新分析" 按钮旁边
<Button variant="outline" onClick={() => setShowPoster(true)} className="gap-2">
  <ImageIcon className="w-4 h-4" />
  生成海报
</Button>
```

同时引入 `InterviewPosterModal` 组件，并传入 `job`、`stage` 数据。

---

## 海报视觉设计

使用与现有 UI 一致的设计语言：
- 背景：白色（`#ffffff`）—— 小红书分享更干净
- 顶部：浅色 indigo 渐变 Header 块，显示公司 + 岗位 + 面试轮次
- 问题卡片：简洁卡片，只显示序号 + 问题文本 + 类别 badge + 表现评级 badge
- 面试复盘：复用现有的编号圆圈、绿色/红色左边框样式
- 底部水印：OfferMind logo（小，灰色） + "由 OfferMind 生成"文字

---

## 实现步骤

1. 安装 `html-to-image` 依赖
2. 新建 `InterviewPosterModal.tsx`，实现海报 DOM 结构和下载逻辑
3. 修改 `AnalysisDetailPanel.tsx`，在已保存视图底部加"生成海报"按钮和弹窗状态

---

## 关于小红书分享的建议

1. **图片尺寸**：小红书最佳比例是 3:4（如 1080×1440px）。由于内容是长图，建议设置海报宽度为 390px，然后下载时用 `pixelRatio: 2` 缩放至 780px，配合内容自适应高度——用户可以直接上传到小红书（长图格式），无需裁剪
2. **水印**：加 OfferMind 品牌名有助于品牌曝光，但建议做成"低调"风格，不影响阅读体验
3. **后续可扩展**：未来可以做不同"海报模板"（简洁版 / 详细版 / 纯题目版），用户选择后一键生成

---

## 改动范围总结

| 文件 | 类型 | 内容 |
|---|---|---|
| `package.json` | 修改 | 新增 `html-to-image` 依赖 |
| `src/components/analytics/InterviewPosterModal.tsx` | 新建 | 海报弹窗 + 下载逻辑 |
| `src/components/analytics/AnalysisDetailPanel.tsx` | 修改 | 新增"生成海报"按钮和弹窗状态 |

不涉及数据库变更，不涉及后端 Edge Function，纯前端实现。
