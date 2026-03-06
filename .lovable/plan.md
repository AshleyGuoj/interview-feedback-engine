

## Time Tracker 事件颜色重设计

当前使用 Tailwind 默认的高饱和度颜色（blue-500, amber-500, purple-500），与平台"Calm Intelligence"低饱和度设计语言不一致。重新设计为柔和但可区分的色系。

### 色彩方案

基于 `index.css` 中已有的设计系统变量（accent-cool, accent-sage, accent-warm, accent-rose）+ 品牌 primary 色，映射如下：

| 事件类型 | 当前颜色 | 新颜色 | 视觉感受 |
|---|---|---|---|
| **applied** (投递) | `text-blue-500` 亮蓝 | `text-[hsl(210,30%,50%)]` accent-cool 蓝灰 | 沉稳、起步 |
| **interview** (面试) | `text-amber-500` 亮琥珀 | `text-[hsl(32,45%,46%)]` accent-warm 暖棕 | 温暖、重要进展 |
| **assessment** (测评) | `text-purple-500` 亮紫 | `text-[hsl(232,36%,36%)]` brand primary 靛蓝 | 品牌色、核心任务 |
| **written_test** (笔试) | `text-indigo-500` 亮靛蓝 | `text-[hsl(260,25%,52%)]` 柔紫 | 与 assessment 区分但同系 |
| **offer** (Offer) | `text-emerald-500` 亮绿 | `text-[hsl(158,25%,42%)]` accent-sage 鼠尾草绿 | 正向结果、低调庆祝 |
| **other** | `text-muted-foreground` | 不变 | 中性 |

**状态覆盖色（保持语义清晰）：**
| 状态 | 当前 | 新颜色 |
|---|---|---|
| completed ✓ | `text-emerald-500` | `text-[hsl(158,30%,38%)]` success 色 |
| scheduling action 📅 | `text-teal-500` | `text-[hsl(210,30%,50%)]` accent-cool |
| deadline ⏰ | `text-red-500` | `text-[hsl(350,30%,52%)]` accent-rose |

**scheduling action 文字颜色**：当前 `text-muted-foreground` 灰色 → 改为 `text-foreground/75`，不再灰色但比正常文字略淡。

### 改动文件

**`src/pages/TimeTracker.tsx`** — 约 15 行改动：
1. `EVENT_COLORS` 换成新色值
2. `EventRow` 中状态覆盖色更新
3. scheduling action 文字从 `text-muted-foreground` 改为 `text-foreground/75`
4. Summary strip 中的图标颜色同步更新

