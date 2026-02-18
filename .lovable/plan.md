

# Career Growth 加载动画重新设计 — 简洁环形进度 + 步骤指示

## 问题

当前的横向 4 格卡片式加载看起来不够精致，格子太小、文字挤在一起，整体视觉不够优雅。

## 新方案：环形脉冲 + 纵向步骤列表

采用一种更干净的设计：顶部是一个带品牌色光晕的圆形图标（类似呼吸灯效果），下方是简洁的纵向步骤列表，但每个步骤前带有圆形数字指示器（1/2/3/4），用颜色和动画区分状态。与 Timeline 的纯文字列表形成差异。

```text
          ╭─────╮
          │  📈 │  ← 品牌色圆形 + 外圈光晕呼吸动画
          ╰─────╯
    Analyzing Your Career Growth

    ① Collecting interview data      ✓
    ② Analyzing competency trends    ← 当前（脉冲）
    ③ Mapping growth trajectory
    ④ Composing growth insights

    ━━━━━━━━━━━━━━━░░░░░░  50%

    This usually takes 15-30 seconds
```

## 改动

### 1. `src/components/analytics/CareerGrowthPanel.tsx`（lines 283-346）

替换当前的 grid 卡片布局为新设计：

- 顶部图标区：`w-14 h-14 rounded-full bg-primary/10` 包裹 `LineChart` 图标，外层加一个 `animate-ping` 的半透明圆圈做呼吸光晕
- 标题文字保持居中
- 步骤列表改为纵向排列，每行左侧是圆形数字指示器（`w-6 h-6 rounded-full`），右侧是文字
  - 已完成：指示器为 `bg-primary text-primary-foreground` + 显示对勾图标
  - 当前激活：指示器为 `border-2 border-primary` + 数字 `animate-pulse`，文字为 `text-foreground font-medium`
  - 未到达：指示器为 `border border-border`，文字为 `text-muted-foreground/40`
- 进度条改为 `h-1 bg-primary/30 rounded-full`，更柔和
- 去掉 `animate-bounce`，改用 `animate-pulse` 更优雅
- 整体间距调大（`gap-8`），让布局更透气

### 2. 不需要修改 i18n 文件

已有的翻译键足够使用，无需新增。
