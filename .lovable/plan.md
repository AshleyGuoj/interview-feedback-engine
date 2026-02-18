

# Job Board UI/UX 优化方案

## 问题诊断

1. **页面标题层级偏弱**：`text-2xl` 比 Dashboard 的 `text-[28px] sm:text-[32px]` 更小，视觉权重不一致
2. **Kanban 列头使用语义色圆点**：applied=slate, interviewing=amber, offer=emerald, closed=gray，与已优化的 Dashboard/Analytics 品牌色体系不一致
3. **InsightStrip 大量 emoji**：📅⏳⚠️🧑‍💼📚💬📩🤝❌📄💤🔁🚫🙅 等，AI 感强烈
4. **InsightStrip 彩色文字**：blue/amber/orange/purple/cyan/green/red 七色并排，过于花哨
5. **StatusBadge 组件 emoji + 彩色底色**：SubStatusBadge、RiskTagBadge、ClosedReasonBadge 全部使用 emoji + 鲜艳色块
6. **Location Badge 彩色底色**：CN=rose, US=blue, Remote=emerald, Other=gray，四种语义色
7. **Star 评分用 amber 填充**：`fill-amber-400 text-amber-400` 荧光黄
8. **状态消息含 emoji**：`'Received offer! 🎉'` 在 statusMessages 中

## 改造策略

### 1. 页面标题对齐

将 Job Board 标题从 `text-2xl` 升级到 `text-[28px] sm:text-[32px]`，与 Dashboard 页面保持一致的视觉权重。

### 2. Kanban 列头颜色统一

将四列的状态圆点从多色（slate/amber/emerald/gray）统一为品牌色深浅：

| 列 | 当前 | 改为 |
|---|---|---|
| Applied | `bg-slate-500` | `bg-primary/40` |
| Interviewing | `bg-amber-500` | `bg-primary/70` |
| Offer | `bg-emerald-500` | `bg-primary` |
| Closed | `bg-gray-400` | `bg-muted-foreground/40` |

用同色系的深浅来表示进展程度，而非多种语义色。

### 3. InsightStrip：emoji 替换 + 去彩色

- 将所有 emoji 替换为 Lucide 图标（`CalendarCheck`, `Clock`, `AlertCircle`, `UserCheck`, `BookOpen`, `MessageSquare`, `Mail`, `Handshake`, `XCircle`, `FileText`, `Moon`, `RotateCcw`, `Ban`, `X`, `HandRaised`）
- 将七种颜色统一为两种：`text-primary/70`（活跃状态）和 `text-muted-foreground`（中性/终结状态）

### 4. StatusBadge 全组件去 emoji + 去彩色底色

**SubStatusBadge**：
- emoji 替换为 Lucide 图标
- 彩色底色（blue-100/amber-100 等）统一为 `bg-primary/10 text-primary`（活跃）或 `bg-muted text-muted-foreground`（中性）

**RiskTagBadge**：
- emoji 替换为 Lucide 图标
- 所有 risk 统一用 `border-muted-foreground/30 text-muted-foreground` 轮廓样式

**ClosedReasonBadge**：
- emoji 替换为 Lucide 图标
- 统一为 `bg-muted/50 text-muted-foreground` 淡化样式

### 5. Location Badge 去彩色

将 CN/US/Remote/Other 四种鲜艳底色统一为 `bg-muted text-muted-foreground`，仅靠文字内容区分，去掉视觉噪音。

### 6. Star 评分品牌色

将 `fill-amber-400 text-amber-400` 改为 `fill-primary text-primary`，未选状态保持 `text-muted-foreground`。

### 7. 状态消息去 emoji

将 `'Received offer! 🎉'` 改为 `'Received offer'`。

### 8. 空状态增强

Kanban 列空状态（当前仅灰色文字 + dashed border）添加一个轻量 Lucide 图标（`Inbox`），与 Dashboard 空状态风格一致。

## 涉及文件

| 文件 | 改动点 |
|------|--------|
| `src/pages/JobBoard.tsx` | 标题字号升级、statusMessages 去 emoji |
| `src/components/jobs/KanbanColumn.tsx` | 列头圆点颜色统一、空状态增强 |
| `src/components/jobs/InsightStrip.tsx` | emoji 替换为 Lucide 图标、颜色统一 |
| `src/components/jobs/StatusBadge.tsx` | 三个 Badge 组件去 emoji + 去彩色底色 |
| `src/components/jobs/DraggableJobCard.tsx` | Location badge 去彩色 |
| `src/components/jobs/JobCard.tsx` | Location badge 去彩色（与 DraggableJobCard 同步） |
| `src/components/jobs/AddJobDialog.tsx` | Star 评分颜色改为品牌色 |

