

# Auth 登录页视觉升级方案

## 当前状态

页面是一个居中的白色卡片 + 纯灰色背景，功能完整但视觉上缺乏吸引力和品牌故事感。用户看到的第一印象偏"工具化"，没有传递出产品的专业定位和价值。

## 设计方向

采用 **左右分屏布局**（桌面端），左侧为品牌展示区，右侧为表单区。移动端保持居中单列。

```text
Desktop (>= 1024px):
┌─────────────────────────┬───────────────────────┐
│                         │                       │
│   OfferMind Logo        │    Explore Demo       │
│                         │    ─── or ───         │
│   "Turn every           │    Login / Sign Up    │
│    interview into       │    [email]            │
│    a strategic          │    [password]         │
│    advantage"           │    [Submit]           │
│                         │                       │
│   ○ 3 value props       │                       │
│     with icons          │                       │
│                         │                       │
│   Subtle geometric      │                       │
│   background pattern    │                       │
│                         │                       │
└─────────────────────────┴───────────────────────┘

Mobile (< 1024px):
┌───────────────────────┐
│   Logo + Tagline      │
│   [Form Card]         │
│   Footer              │
└───────────────────────┘
```

## 具体改动

### 文件：`src/pages/Auth.tsx`

#### 1. 左侧品牌展示区（仅桌面端显示）

- 深色品牌背景：`bg-[hsl(232,30%,14%)]`，与 primary indigo 同色系但更深
- Logo + 产品名 + 一句话 tagline
- 3 个 value proposition 条目，每个带 lucide 图标：
  - `BarChart3` — "Structured interview analytics across all your applications"
  - `TrendingUp` — "Track competency growth and identify patterns over time"  
  - `Shield` — "Private, secure career intelligence you own"
- 右下角一个极淡的几何装饰（纯 CSS，2-3 个 `absolute` 圆形，模糊处理，opacity 很低），增加空间层次感
- 文字用 `text-white/90` 和 `text-white/50`，保持可读性

#### 2. 右侧表单区

- 保持现有表单逻辑完全不变
- 背景改为 `bg-white`（桌面端占据右半屏）
- 移除外层卡片的 border 和 shadow（桌面端不需要，右半屏本身就是容器）
- 移动端保持现有卡片样式

#### 3. 入场动画

- 左侧内容使用 CSS `@keyframes fadeInUp`，从 `opacity:0 translateY(12px)` 到 `opacity:1 translateY(0)`，持续 600ms
- 3 个 value props 依次延迟 100ms 出现（stagger effect）
- 右侧表单用同样动画但延迟 200ms
- 全部用纯 CSS animation，无需额外依赖

#### 4. 底部 footer

- 移入右侧表单区底部
- 桌面端左侧底部显示 "2026 OfferMind" 版权信息

### 文件：`src/index.css`

添加 `fadeInUp` keyframe 动画：

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}
```

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/pages/Auth.tsx` | 重构布局为左右分屏 + 品牌区 + 入场动画 |
| `src/index.css` | 添加 fadeInUp 动画 |

## 设计原则

- 左侧深色区域传递"专业基础设施"感，而非"AI 工具"感
- Value props 用简洁英文，每条一行，不超过 10 个词
- 几何装饰极度克制（2-3 个模糊圆形，opacity < 0.1），不喧宾夺主
- 移动端完全回退到现有居中布局，不会破坏小屏体验
- 所有动画 < 1s，respect `prefers-reduced-motion`

