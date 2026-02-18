
# Role Debrief 功能引导提示

## 目标

当用户选中的 Job 已有 2+ 轮分析完成时，在 Interview Analysis 面板底部或顶部显示一个醒目但不干扰的引导横幅，提示用户可以切换到 Role Debrief 标签查看聚合分析。

## 设计方案

在 `activeTab === 'rounds'` 且 `isDebriefUnlocked === true` 时，在 AnalysisDetailPanel 上方插入一个引导卡片：

- 使用 `bg-primary/5 border border-primary/20` 的柔和品牌色背景
- 左侧显示 `TrendingUp` 图标
- 文案：提示已有 N 轮分析，可以使用 Role Debrief 查看聚合洞察
- 右侧显示一个按钮，点击后切换到 debrief 标签

```text
+----------------------------------------------------------+
| [TrendingUp]  2 rounds analyzed -- Role Debrief    [View] |
|               is ready for aggregate insights             |
+----------------------------------------------------------+
```

## 改动

### 文件：`src/pages/Analytics.tsx`

1. 在 `activeTab === 'rounds'` 分支内、`AnalysisDetailPanel` 或空状态之前，增加条件渲染：当 `isDebriefUnlocked` 为 true 时显示引导横幅
2. 横幅包含一个按钮，`onClick` 设置 `setActiveTab('debrief')`
3. 导入 `TrendingUp`（已在文件中导入）

### 文件：`src/lib/i18n/locales/en.ts` 和 `src/lib/i18n/locales/zh.ts`

添加翻译键：
- `analytics.debriefReady`: 引导文案标题
- `analytics.debriefReadyDesc`: 引导文案描述
- `analytics.viewDebrief`: 按钮文字

不涉及其他文件变更。
