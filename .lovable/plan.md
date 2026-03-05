

## 分析：按 Category 分列 vs 当前 4 列看板

这是个很好的想法，但需要权衡几个因素。让我先分析利弊，再给出推荐方案。

### 当前架构
4 列：Applied → Interviewing → Offer → Closed

### 你提议的方案
8 列：投递 → 简历筛选 → 测评 → 笔试 → 面试 → HR沟通 → Offer沟通 → 收到Offer

### 需要考虑的问题

**1. "Closed" 去哪里？**
被拒、主动放弃、HC冻结的岗位目前都在 Closed 列。如果改成 category 列，这些卡片放在哪？需要额外加一列 Closed，或者在每列里用视觉标记。

**2. 一个 Job 可能有多个阶段**
比如一个 Job 同时有 "简历筛选（已通过）" 和 "面试（待进行）"，它应该显示在哪一列？→ 需要按 **当前最高活跃阶段** 来归类。

**3. 8 列水平空间**
屏幕上 8 列会比较拥挤，每列宽度会被压缩。

### 推荐方案：按 Category 分列，合并低频列

将 8 个 category 合并为 **6 列**，更实用：

```text
投递/筛选 → 测评/笔试 → 面试 → HR沟通 → Offer → Closed
```

- **投递/筛选**：合并 application + resume_screen（都是早期阶段）
- **测评/笔试**：合并 assessment + written_test
- **面试**：interview（核心阶段，单独一列）
- **HR沟通**：hr_chat（谈薪阶段）
- **Offer**：合并 offer_call + offer_received
- **Closed**：所有终态岗位

### 技术实现

**判断 Job 归属哪一列的逻辑：**
- 遍历 Job 的所有 stages，找到 **category 优先级最高且状态为活跃** 的阶段
- 优先级：offer_received > offer_call > hr_chat > interview > written_test > assessment > resume_screen > application
- 如果所有 pipeline 都是终态 → Closed 列
- 如果没有任何活跃阶段 → 投递/筛选 列

**需要改的文件：**
1. `src/types/job.ts` — 新增 `KanbanColumn` 类型，修改或替换 `JobStatus`
2. `src/contexts/JobsContext.tsx` — `deriveJobStatusFromStages` 改为按 category 优先级判断
3. `src/components/jobs/KanbanBoard.tsx` — 6 列替换 4 列
4. `src/components/jobs/KanbanColumn.tsx` — 更新 columnConfig
5. `src/pages/JobBoard.tsx` — 适配新列逻辑
6. `src/components/jobs/InsightStrip.tsx` — 适配新列的子状态展示

**拖拽行为调整：**
把卡片拖到不同列 = 手动覆盖该 Job 的当前阶段归类（或者禁止拖拽，完全由阶段数据驱动）。

---

你觉得 6 列合并方案可以吗？还是你更倾向完整的 8 列？另外拖拽时应该怎么处理——是允许手动拖动改变状态，还是完全由阶段数据自动驱动？

