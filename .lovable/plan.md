
# 修复：已保存视图的「面试复盘」与新分析结果完全对齐

## 问题全貌

经过代码对比，有 **2 个层面**的不一致：

---

### 层面 1：`InterviewReflection` 类型缺少 `performanceSummary` 字段

Fresh 分析视图的 `ReflectionDisplay` 组件第一个展示的是"总体评价"卡片（`reflection.performanceSummary`），但 `InterviewReflection` 类型里根本没有这个字段，导致：
- 保存时 `performanceSummary` 被丢弃
- 已保存视图里没有"总体评价"这一块

---

### 层面 2：已保存视图的面试复盘 UI 与 `ReflectionDisplay` 完全不同

Fresh 分析用 `<ReflectionDisplay />` 组件（lines 633-718），已保存视图用内联代码（lines 266-330）。两者差异逐项对比：

| 内容块 | Fresh 分析视图 | 已保存视图 |
|---|---|---|
| 总体评价 (`performanceSummary`) | ✅ Card 卡片展示 | ❌ **完全缺失** |
| 表现良好 | ✅ 编号圆圈 `2` + 绿色左边框 | ❌ 无编号，无左边框格式 |
| 可改进之处 | ✅ 编号圆圈 `3` + 红色左边框 | ❌ 无编号，无左边框格式 |
| 关键收获 | ✅ 编号圆圈 `4` + 圆角背景 badge 列表 | ❌ 无编号，badge 列表但无背景 |
| 面试官风格 | ✅ 编号圆圈 `5` | ❌ 无编号 |
| 公司洞察 | ✅ 编号圆圈 `6` | ❌ 无编号 |

---

## 修复方案

### 改动 1：`src/types/job.ts`

在 `InterviewReflection` 接口中新增 `performanceSummary` 可选字段：

```ts
export interface InterviewReflection {
  overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad';
  performanceSummary?: string;   // ← 新增
  whatWentWell: string[];
  whatCouldImprove: string[];
  ...
}
```

### 改动 2：`src/components/analytics/AnalysisDetailPanel.tsx` — `handleSaveAll`

保存时补充 `performanceSummary` 字段：

```ts
const newReflection: InterviewReflection = {
  overallFeeling: result.reflection.overallFeeling,
  performanceSummary: result.reflection.performanceSummary,  // ← 新增
  whatWentWell: result.reflection.whatWentWell,
  ...
};
```

### 改动 3：`src/components/analytics/AnalysisDetailPanel.tsx` — 已保存视图的复盘 UI

将 lines 266-330 的内联复盘代码**整体替换**为直接调用 `<ReflectionDisplay />` 组件，传入 `stage.reflection` 数据（需要做类型适配，把 `InterviewReflection` 适配成 `ExtractedReflection` 形状）。

这样两个视图共用同一个组件，从根本上保证"永远一致"，不需要维护两份平行代码。

---

## 需要修改的文件

| 文件 | 修改内容 |
|---|---|
| `src/types/job.ts` | `InterviewReflection` 新增 `performanceSummary?: string` |
| `src/components/analytics/AnalysisDetailPanel.tsx` | ① `handleSaveAll` 补充 `performanceSummary`；② 已保存的复盘 UI 替换为 `<ReflectionDisplay />`；③ `ReflectionDisplay` 的 props 类型扩展为同时支持两种类型 |

## 改动范围

- 只新增可选字段，旧数据兼容（`performanceSummary` 为 `undefined` 时 UI 做 `?.` 保护）
- 不涉及数据库 schema 变更（数据存在 JSONB 字段中）
- 问题卡片部分（`SavedQuestionCard` vs `QuestionCard`）**已经在上一次修复中对齐**，本次不需要再动
