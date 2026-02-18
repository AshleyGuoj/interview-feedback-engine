

# Timeline 页面布局混搭方案

## 问题分析

当前页面有 5 个区域全部使用 `rounded-2xl border shadow` 的卡片样式，视觉上过于重复，缺乏节奏感。

## 改造策略

保持现有信息架构和 UX 不变，仅调整各区块的**容器样式**，引入 3 种不同的呈现方式混搭使用：

### 区块样式分配

| 区块 | 当前样式 | 改为 | 原因 |
|------|---------|------|------|
| Hero Signal | 带边框卡片 | **保留卡片**（唯一保留边框的大卡片） | 作为页面焦点，需要视觉容器 |
| Momentum | 带边框卡片 | **无边框开放区块**，仅用左侧竖线装饰 | 用排版层级代替容器 |
| Coach Note | 带边框卡片 | **无边框开放区块**，用分隔线和缩进 | 像备忘录，不需要盒子 |
| Patterns | 带边框卡片 | **底色区块**（无边框，subtle 背景色） | 用背景区分，不用边框 |
| Timeline Items | 每条都是卡片 | **纯文本行 + 左侧时间线**，仅 turning point 保留轻卡片 | 减少最大量的重复卡片 |

### 技术细节

**1. MomentumIndicator** — 改为左侧 accent line 样式
- 移除 `rounded-2xl bg-card border shadow`
- 改为 `border-l-2 border-l-primary/20 pl-5`（左侧竖线 + 内边距）
- 内容排版不变

**2. CoachNote** — 改为开放式备忘录
- 移除外层卡片容器
- 保留顶部标签 + 分隔线 + bullet 列表
- 用 `pl-5` 缩进和 `border-l border-border` 创造层次

**3. PatternsList** — 改为浅底色无边框区块
- 移除 `border` 和 `shadow`
- 保留 `rounded-xl` 和 `surface-elevated` 背景
- 让背景色做分隔，不靠边框

**4. SignalTimelineItem** — 弱化卡片
- Medium/Weak signal：移除 `border` 和 `bg-card`，变成纯文本行（仅靠左侧 timeline spine 连接）
- Strong signal：保留极轻的底色，无边框
- Turning point：保留轻卡片（唯一保留边框的 timeline item）

**5. 两列网格调整**
- Momentum 和 CoachNote 的网格间距从 `gap-6` 改为 `gap-8`，因为去掉卡片后需要更多留白

### 最终视觉节奏

```text
[页面标题 — 开放文本]
        ↓
[Hero Signal — 唯一大卡片，有边框 + 品牌底色]
        ↓
[Momentum | Coach Note — 两列开放区块，左侧竖线]
        ↓
[Patterns — 浅底色无边框区块]
        ↓
[Signal Timeline — 纯文本行，仅 turning point 有轻卡片]
```

这样整个页面只有 Hero 和少数 turning point 使用卡片，其余区块通过排版、竖线、底色来区分，打破重复感。
