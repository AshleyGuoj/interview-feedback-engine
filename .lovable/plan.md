

# Dashboard UI/UX 优化方案

## 1. 指标标签颜色升级（用户明确要求）

当前 MetricCell 的标签（进行中的申请、面试中、已获得 Offer、回复率）使用 `text-muted-foreground`（灰色 44% 亮度），视觉存在感低。

**改动：**
- 标签文字从 `text-muted-foreground` 改为 `text-primary/70`（灰紫色，使用品牌 indigo 色 + 70% 透明度）
- 数字从 `text-foreground` 改为 `text-primary`（深紫色），让关键数据更突出
- hint 文字保持 `text-muted-foreground/60` 不变，维持层级

**涉及文件：** `src/pages/Dashboard.tsx` 的 `MetricCell` 组件

## 2. 额外 UI/UX 优化建议（供选择）

### 方案 A：Career Health 区块视觉提升
- 给 Career Health 区块加上左侧品牌色竖线装饰（`border-l-3 border-l-primary/30`），与 Timeline 页面的 open section 风格呼应
- 移除外边框，改为 `surface-insight` 背景底色，让它从页面背景中浮出但不像卡片那么重

### 方案 B：Interview Pipeline 条目增加公司 Logo 占位符
- 每个面试条目左侧添加一个小圆形 avatar（用公司首字母 + 品牌底色），增加视觉锚点
- 提升扫描效率，用户一眼就能分辨不同公司

### 方案 C：底部 Quick Action 改为渐变 CTA
- 当前底部 "准备面试" 入口太平淡，容易被忽略
- 改为品牌色微渐变背景（`bg-gradient-to-r from-primary/5 to-primary/10`）+ 箭头图标增加 hover 动画
- 让用户有明确的下一步行动指引

### 方案 D：混搭容器样式（与 Timeline 页面一致）
- Interview Pipeline 保留卡片边框
- Signal Feed（最近动态）改为无边框开放样式，用左侧竖线装饰
- 打破两个并排卡片的视觉重复感

---

## 本次实施范围

先实施 **第 1 项（指标标签颜色）** + **方案 A（Career Health 视觉提升）** + **方案 C（底部 CTA 微调）**，这三项改动小但效果明显。方案 B 和 D 可后续按需追加。

### 技术细节

| 位置 | 当前 | 改为 |
|------|------|------|
| MetricCell 数字 | `text-foreground` | `text-primary` |
| MetricCell 标签 | `text-muted-foreground` | `text-primary/70` |
| Career Health 容器 | `border border-border bg-card` | `border-l-3 border-l-primary/30 surface-insight`（去掉全边框） |
| Quick Action 容器 | `border border-border bg-card` | `border border-primary/15 bg-gradient-to-r from-primary/[0.03] to-primary/[0.07]` |
| Quick Action 箭头 | 静态 | 加 `group-hover:translate-x-1 transition-transform` |

**涉及文件：** 仅 `src/pages/Dashboard.tsx`

