
# 修复：海报图标与平台 UI 不一致（emoji 变成 AI 风格图标）

## 根本原因

`InterviewPosterModal.tsx` 的 `PosterContent` 组件在以下地方使用了 emoji 和 Unicode 文字符号：

- `SectionTitle` 组件用 `"📝"` 和 `"💡"` 作为图标
- "表现良好"区块用 `"✓"` 字符标记每条内容
- "可改进之处"区块用 `"→"` 字符标记每条内容

当 `html-to-image` 把 DOM 转成 PNG 时，emoji 会用操作系统字体（macOS 上是 Apple Color Emoji）渲染，看起来就是"AI 风格的彩色 emoji"，与平台里干净的 Lucide SVG 图标完全不同。

平台实际 UI（`AnalysisDetailPanel.tsx` 里的 `ReflectionDisplay`）用的是：
- 数字圆圈 + `CheckCircle2` Lucide 图标（表现良好）
- 数字圆圈 + `AlertCircle` Lucide 图标（可改进）
- 数字圆圈 + `Lightbulb` Lucide 图标（核心收获）
- 数字圆圈 + 无图标（面试官风格、公司洞察）
- Section 标题：`MessageSquare` + `Lightbulb` 图标

## 修复方案

**把所有 emoji 和 Unicode 符号替换成内联 SVG 路径**。`html-to-image` 能完美捕获内联 SVG，完全不依赖操作系统字体，视觉与平台完全一致。

### 具体改动：`src/components/analytics/InterviewPosterModal.tsx`

**改动 1：`SectionTitle` 组件**

将 `number` prop（原本接收 `"📝"` 这样的 emoji）改为接收 SVG 路径，或者直接换成数字圆圈 + 一个 SVG icon prop 的设计，与平台 `ReflectionDisplay` 一致：

```tsx
// Before
<SectionTitle number="📝" title={`面试题目（${questions.length} 题）`} />
<SectionTitle number="💡" title="面试复盘" />

// After - 使用内联 SVG（与平台图标一致）
<SectionTitle icon={<MessageSquareSvg />} title={`面试题目（${questions.length} 题）`} />
<SectionTitle icon={<LightbulbSvg />} title="面试复盘" />
```

**改动 2：在文件底部新增两个 SVG helper 函数**

提取 Lucide 对应图标的 SVG path 路径，封装成内联组件：
- `MessageSquareSvg`：对应 Lucide `MessageSquare`
- `LightbulbSvg`：对应 Lucide `Lightbulb`
- `CheckSvg`：对应 Lucide `Check`（用在"表现良好"每条）
- `ArrowRightSvg`：对应 Lucide `ArrowRight`（用在"可改进"每条）
- `CheckCircleSvg`：对应 Lucide `CheckCircle2`

**改动 3："表现良好"每条内容的前缀符号**

```tsx
// Before
<span style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }}>✓</span>

// After - 内联 SVG
<CheckSvg color="#16a34a" />
```

**改动 4："可改进之处"每条内容的前缀符号**

```tsx
// Before
<span style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }}>→</span>

// After - 内联 SVG
<ArrowRightSvg color="#dc2626" />
```

**改动 5：反射复盘各小节的 section 标题图标**

将 `"✓ 表现良好"` 里的 `✓` 替换为 `CheckCircleSvg`，与平台 `ReflectionDisplay` 里的 `CheckCircle2` 图标一致。

将 `"→ 可改进之处"` 里的 `→` 替换为 `AlertCircleSvg`（对应平台的 `AlertCircle`）。

**改动 6：`SectionTitle` 组件定义更新**

```tsx
// Before
function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      <span style={{ fontSize: '15px' }}>{number}</span>   // ← emoji 在这里
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{title}</span>
    </div>
  );
}

// After
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      {icon}   // ← 内联 SVG，不依赖操作系统字体
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{title}</span>
    </div>
  );
}
```

## 海报与平台对比（修复前后）

| 元素 | 修复前（下载图片） | 修复后（下载图片） |
|---|---|---|
| 面试题目 section 标题 | 📝 emoji（彩色，AI 风格） | MessageSquare SVG（平台同款） |
| 面试复盘 section 标题 | 💡 emoji（彩色，AI 风格） | Lightbulb SVG（平台同款） |
| 表现良好每条前缀 | ✓ Unicode 字符 | Check SVG 图标 |
| 可改进每条前缀 | → Unicode 字符 | ArrowRight SVG 图标 |

## 改动范围

| 文件 | 类型 | 内容 |
|---|---|---|
| `src/components/analytics/InterviewPosterModal.tsx` | 修改 | 替换所有 emoji 和 Unicode 符号为内联 SVG；更新 `SectionTitle` 组件接口 |

- 不涉及后端、数据库、Edge Function
- 不影响海报的下载/复制逻辑
- 视觉与平台完全一致，不依赖操作系统字体
