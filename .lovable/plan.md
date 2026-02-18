

# Career Growth 加载状态优化 — 卡片式步骤动画

## 目标

替换当前简单的旋转图标加载状态，改为一个更新颖的「卡片式步骤」动画，与 Timeline 的纵向列表式加载做出视觉区分。

## 设计理念

Timeline 用的是**纵向文字列表逐行高亮**。Career Growth 改用**横向 4 格卡片依次激活**的布局，每个卡片包含图标 + 标签，当前激活卡片有品牌色发光效果和缩放动画，整体更具「仪表盘分析」的感觉。

```text
Timeline（已有）:            Career Growth（新方案）:
  · Scanning history           ┌────┐ ┌────┐ ┌────┐ ┌────┐
  · Detecting signals          │ 📄 │ │ 🧠 │ │ 📈 │ │ ✨ │
  · Mapping momentum           │收集│ │趋势│ │轨迹│ │洞察│
  · Composing insights         └────┘ └────┘ └────┘ └────┘
                                 ▲ active (glow + scale)
```

## 改动

### 1. `src/components/analytics/CareerGrowthPanel.tsx`（lines 261-272）

替换 loading 状态为新的多步骤动画：

- 外层保持 `h-full flex items-center justify-center p-6`，确保垂直居中
- 内层使用 `rounded-xl border bg-card py-16 w-full max-w-lg` 的卡片容器
- 顶部：品牌色图标 + 标题文字
- 中间：4 个步骤格子横向排列（`grid grid-cols-4 gap-3`），每个格子显示图标和标签
  - 当前激活步骤：`bg-primary/10 border-primary/30 text-primary scale-105` + 图标 `animate-bounce`
  - 已完成步骤：`bg-muted/50 text-muted-foreground` + 小对勾标记
  - 未到达步骤：`bg-muted/20 text-muted-foreground/40`
- 底部：连续进度条 + 提示文字
- 使用 `useState` + `useEffect` + `setInterval`（2.5s）轮换步骤
- 所有过渡使用 `transition-all duration-500` 实现平滑切换

### 2. `src/lib/i18n/locales/en.ts`

在 `careerGrowth` 下添加：

| Key | Value |
|---|---|
| `loadingTitle` | Analyzing Your Career Growth |
| `loading_collectData` | Collecting Data |
| `loading_analyzeTrends` | Analyzing Trends |
| `loading_mapGrowth` | Mapping Growth |
| `loading_composeInsights` | Composing Insights |
| `loadingHint` | This usually takes 15-30 seconds |

### 3. `src/lib/i18n/locales/zh.ts`

在 `careerGrowth` 下添加：

| Key | Value |
|---|---|
| `loadingTitle` | 正在分析你的职业成长 |
| `loading_collectData` | 收集数据 |
| `loading_analyzeTrends` | 分析趋势 |
| `loading_mapGrowth` | 计算轨迹 |
| `loading_composeInsights` | 生成洞察 |
| `loadingHint` | 通常需要 15-30 秒 |

不涉及其他文件变更。
