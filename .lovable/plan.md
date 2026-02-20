
# 修复：保存后的问题详情显示与分析结果对齐

## 问题根因

**两个独立的 bug，叠加导致用户看到的不一致：**

### Bug 1：保存时字段丢失

`handleSaveAll`（line 151-160）将 AI 分析结果映射到 `InterviewQuestion` 时，只保存了部分字段：

```ts
// 当前：只保存了这些
{
  question: q.question,
  category: q.category,
  myAnswer: q.myAnswerSummary,     // ← 答案摘要
  difficulty: q.difficulty,
  wasAsked: true,
  answeredWell: q.responseQuality === 'high',
  tags: q.tags,
  // ❌ q.evaluationFocus 没有保存（面试重点）
  // ❌ q.qualityReasoning 没有保存（表现原因）
  // ❌ q.responseQuality 没有保存（用来显示表现良好/中/差）
}
```

`InterviewQuestion` 类型里没有 `evaluationFocus` 和 `qualityReasoning` 字段，这些 AI 产出的内容被彻底丢弃了。

### Bug 2：已保存视图的问题卡片不支持展开

保存后的"existing analysis"视图（lines 236-268）里，每个问题只用一个简单 `<Card>` 显示，**没有用 `<Collapsible>` 展开组件**，所以即使字段保存成功，用户也无法看到下拉详情（面试重点、原因、标签等）。

## 修复方案

### 改动 1：扩展 `InterviewQuestion` 类型 — `src/types/job.ts`

在 `InterviewQuestion` 接口中新增三个可选字段：

```ts
export interface InterviewQuestion {
  // ...现有字段...
  evaluationFocus?: string;    // 面试重点（AI 提取）
  qualityReasoning?: string;   // 表现原因（AI 提取）
  responseQuality?: 'high' | 'medium' | 'low'; // 表现评级
}
```

### 改动 2：保存时包含全部字段 — `AnalysisDetailPanel.tsx` `handleSaveAll`

```ts
const newQuestions: InterviewQuestion[] = result.questions.map((q, index) => ({
  id: `extracted-${Date.now()}-${index}`,
  question: q.question,
  category: q.category,
  myAnswer: q.myAnswerSummary,
  difficulty: q.difficulty,
  wasAsked: true,
  answeredWell: q.responseQuality === 'high',
  responseQuality: q.responseQuality,   // ✅ 新增
  evaluationFocus: q.evaluationFocus,   // ✅ 新增
  qualityReasoning: q.qualityReasoning, // ✅ 新增
  tags: q.tags,
}));
```

### 改动 3：已保存视图的问题卡片改为可展开 — `AnalysisDetailPanel.tsx`（lines 236-268）

将现有的静态 `<Card>` 替换为与分析结果视图一致的 `<Collapsible>` 卡片，展开后显示：

- **我的回答**（`myAnswer`）
- **面试重点**（`evaluationFocus`）— 原来不展示
- **表现原因**（`qualityReasoning`）— 原来不展示
- **表现评级 badge**（`responseQuality` 对应 QUALITY_CONFIG）— 原来只用 thumbsUp/Down 图标
- **标签 badges**（`tags`）— 原来不展示

这样保存后的展示与分析结果视图完全对齐，用户不会感受到数据丢失。

## 需要修改的文件

| 文件 | 修改内容 |
|---|---|
| `src/types/job.ts` | `InterviewQuestion` 新增 3 个可选字段 |
| `src/components/analytics/AnalysisDetailPanel.tsx` | `handleSaveAll` 加 3 个字段；existing questions 展示改用 Collapsible 卡片 |

## 改动范围

- 只新增可选字段，不破坏现有数据（旧记录里这些字段为 `undefined`，UI 有 `?.` 保护）
- 已有的问题数据不受影响
- 不需要修改数据库 schema（数据存在 JSONB 的 `stages` 字段里，天然支持任意字段扩展）
