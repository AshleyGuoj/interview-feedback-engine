
# 将所有 AI Agent 输出语言锁定为中文

## 目标

无论用户的 UI 语言是什么，所有 AI Agent 生成的分析内容（Interview Analysis、Transcript Analyzer、Role Debrief、Career Growth、Career Signals）全部强制输出中文。

## 问题根源

当前有两个层面的问题：

**第一层：默认语言是英文**
`src/lib/i18n/index.ts` 中，当 localStorage 没有保存语言时默认用 `'en'`。

**第二层：部分调用点没有传 `language` 参数**
3 个调用点完全没有传 `language`，导致边缘函数用自己的默认值（也是 `'en'`）：

| 文件 | 函数 | 是否传 language |
|---|---|---|
| `CareerGrowthPanel.tsx` | `analyze-career-growth` | ✅ 传了 |
| `RoleDebriefPanel.tsx` | `generate-role-debrief` | ✅ 传了 |
| `CareerSignalTimeline.tsx` | `analyze-career-signals` | ✅ 传了 |
| `AnalysisDetailPanel.tsx` | `analyze-transcript` | ✅ 传了 |
| `TranscriptAnalyzer.tsx` | `analyze-transcript` | ❌ 没传 |
| `InterviewAnalysis.tsx` | `analyze-transcript` | ❌ 没传 |
| `Index.tsx` | `analyze-interview` | ❌ 没传 |
| `AnalyzeInterview.tsx` | `analyze-interview` | ❌ 没传 |

## 方案

### 1. `src/hooks/useLanguage.ts`

将 `language` 的 fallback 从 `'en'` 改为 `'zh'`，保证调用 `useLanguage()` 的地方默认使用中文。

### 2. `src/lib/i18n/index.ts`

将 `getSavedLanguage()` 的 localStorage 默认值从 `'en'` 改为 `'zh'`，保证首次使用的用户默认语言是中文。

### 3. `src/components/interview/TranscriptAnalyzer.tsx`

- import `useLanguage` hook
- 在 `handleAnalyze` 的 invoke body 中加入 `language`

### 4. `src/pages/InterviewAnalysis.tsx`

- import `useLanguage` hook
- 在 `handleAnalyze` 的 invoke body 中加入 `language`

### 5. `src/pages/Index.tsx` 和 `src/pages/AnalyzeInterview.tsx`

- import `useLanguage` hook
- 在 `handleSubmit` 的 invoke body 中加入 `language`

## 效果

修改后，所有 AI Agent 的输出都会跟随用户当前语言设置。由于默认语言改为中文，新用户的所有分析结果都会是中文。已选择英文 UI 的用户如果需要英文分析，可以通过语言切换器控制。

这是最灵活的方案——把"分析语言跟随 UI 语言"这件事做完整，而不是硬编码成中文，这样英文用户也不会受影响。
