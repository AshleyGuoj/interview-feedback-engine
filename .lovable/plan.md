

# Dashboard UI/UX 优化方案

## 问题诊断

从截图和代码分析，当前 Dashboard 存在以下问题：

1. **页面标题与 Career Health 标签重复**：页面标题是 "Dashboard"，Career Health 区块又显示 "DASHBOARD"（大写），语义重复且混淆
2. **标题层级不够**：Dashboard 标题用 `text-[22px]`，而 Timeline 页用 `text-[32px]`，Dashboard 作为首页反而视觉存在感最弱
3. **两个并排 Card 形式完全一致**：Interview Pipeline 和 Recent Activity 都是 `border border-border bg-card` 圆角卡片，视觉节奏单一
4. **空状态缺乏设计**：只有一行灰色文字居中，显得页面"空荡"且没有引导感
5. **缺少时间问候**：作为每天第一个看到的页面，没有个性化问候

## 改造策略

### 1. 标题升级 + 时段问候

- 标题从 `text-[22px]` 升级到 `text-[28px]` 或 `text-[32px]`，与 Timeline 页视觉权重对齐
- 副标题替换为时段问候："Good morning" / "Good afternoon" / "Good evening"，增加人性化感受

### 2. Career Health 标签修正

- 将 Career Health 区块的标签从 `t('dashboard.title')` (即 "Dashboard") 改为固定的 "Career Health"，消除与页面标题的重复
- 保持左侧品牌竖线和 `surface-insight` 背景不变

### 3. Signal Feed 改为开放区块

与之前 Role Debrief 和 Interview Analysis 优化一致：
- Interview Pipeline 保留 Card（有时间/deadline 等结构化信息需要容器）
- Recent Activity（Signal Feed）去掉 Card 边框，改为 `border-l-2 border-l-primary/30 pl-5` 开放区块
- 打破两个并排卡片的视觉重复感

### 4. 空状态增强

为 Interview Pipeline 和 Signal Feed 的空状态添加：
- 一个轻量 Lucide 图标（`CalendarDays` / `Inbox`）
- 简短的引导文案 + 行动提示
- 图标颜色 `text-muted-foreground/30`，不抢焦点但增加页面质感

### 5. Interview Pipeline 条目加公司首字母头像

- 每个面试条目左侧添加公司名首字母圆形头像（`bg-primary/10 text-primary` 底色）
- 增加视觉锚点，扫描效率更高

## 涉及文件

仅 `src/pages/Dashboard.tsx`

## 技术细节

| 位置 | 当前 | 改为 |
|------|------|------|
| 页面标题 | `text-[22px]` | `text-[28px] sm:text-[32px]` |
| 副标题 | 静态 welcome text | 时段问候 (Good morning/afternoon/evening) |
| Career Health 标签 | `t('dashboard.title')` = "Dashboard" | `"Career Health"` 固定文案 |
| Signal Feed 容器 | `rounded-xl border border-border bg-card` | `border-l-2 border-l-primary/30 pl-5`（去掉卡片） |
| 空状态 | 纯文字居中 | 图标 + 文字 + 引导 |
| 面试条目 | 无头像 | 公司首字母圆形头像 `w-8 h-8 rounded-full bg-primary/10` |

