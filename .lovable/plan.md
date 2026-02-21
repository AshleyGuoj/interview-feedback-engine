

# 更新文档：Backbone + Role Overlay Generator 架构

## 概述

将文档中的能力框架从"固定 10 维"升级为 **Backbone (8 维) + Role Overlay Generator** 双层架构。核心理念：Overlay 不是预写的岗位词典，而是从候选人面试数据中"长出来"的岗位专科检查项。

## 修改点（共 4 处）

### 修改 1：重写「决策 1：10 维能力框架」(第 174-196 行)

将固定 10 维列表替换为双层结构：

**Core Backbone（8 维，跨岗位通用）：**

| 维度 | 覆盖范围 |
|------|---------|
| Problem Framing | 问题定义、用户洞察、需求分析 |
| Structured Thinking | 结构化思维、框架运用、逻辑推理 |
| Execution & Prioritization | 项目推进、优先级管理、落地能力 |
| Data & Metrics Thinking | 数据驱动决策、指标设计、实验思维 |
| Communication & Influence | 表达清晰度、说服力、跨团队协作 |
| System Thinking | 系统性思维、架构意识、可扩展性 |
| Technical Fluency | 技术理解深度、工程判断力 |
| Strategic Judgment | 商业判断、市场分析、战略思维 |

**Role Overlay Generator（从面试数据生成，非预定义）：**

说明这是一个 3 步流程：
1. **Step A - 结构化提取**：Layer 1 从每轮面试中提取 topic_tags + skill_signals + evidence
2. **Step B - 跨轮聚合**：Layer 2 统计"高频 + 高影响"模式（面试官反复考什么、你反复暴露什么）
3. **Step C - 生成 Overlay**：将高频模式命名为 3-7 个 Overlay 维度，附带 rubric 和证据引用

加入后端岗位示例：5 轮面试后系统可能自动生成 Reliability & SLO Thinking / Data Modeling & Consistency / API Abstraction & Boundaries

**3 个护栏：**
- 数量上限：每个岗位 debrief 最多 3-7 个 Overlay
- 强制映射：每个 Overlay 绑定 1-3 个 Core 维度（如 Reliability -> System Thinking + Technical Fluency + Execution）
- 证据约束：Overlay 的产生必须能引用面试题/回答/JD 的证据，无证据则不生成

**设计理念：** 能力 = Cognitive Skill x Domain Context。Core 用于长期趋势（Career Growth），Overlay 用于岗位精细分析（Role Debrief）。

加入关于原 10 维重叠问题的承认：Technical Depth / System Design / AI Skills 在 AI PM 语境下高度交叉，这是迭代到双层架构的动因。

**预置 Domain Packs（候选维度池，不是穷举）：**

少量高频 Pack 作为 Overlay Generator 的候选池：
- Engineering Pack：Reliability/SLO、API Modeling、Scalability Trade-offs、Debugging & Incident Thinking
- Design Pack：Interaction Design、Visual Hierarchy、User Research、Design Systems
- Data Pack：Statistical Reasoning、Pipeline Architecture、Feature Engineering
- AI/ML Pack：Model Evaluation、Prompt Design、AI Risk & Reliability、Human-AI Experience

最终 Overlay 仍由 Generator 结合 JD + 面试数据选择/改写，Pack 只提供候选池。

### 修改 2：重写「Trade-off 5：通用 vs 定制框架」(第 286-295 行)

展开为三方案对比：

| 方案 | 优势 | 劣势 |
|------|------|------|
| **方案 A：完全通用** | 跨岗位可对比 | 忽略岗位差异，AI PM 和 Tech PM 被"稀释" |
| **方案 B：完全定制** | 精准贴合 JD | 跨岗位不可比，Career Growth Agent 失效 |
| **方案 C：Backbone + Overlay** (采用) | 核心稳定 + 岗位可扩展 | 需要维护 Generator 的质量和护栏 |

决策逻辑：Career Growth Agent 的核心价值在于跨岗位纵向对比，必须有一套稳定 Backbone。但纯通用又会忽略岗位差异。Overlay Generator 从面试数据中自动派生岗位维度，而非预定义几百个岗位包。

加入一句面试高分表达：
> We don't attempt to predefine overlays for every role. Instead, we use a Role Overlay Generator that derives role-specific dimensions from the interview evidence, constrained by a schema and mapped back to the core backbone for comparability.

加入诚实承认的局限：
- Overlay 在样本少（仅 1 轮）时置信度低，需要 2-3 轮才稳定
- 面试官风格差异是噪音源，用"频率 x 影响"排序 + 证据约束来缓解
- 维度分类基于面试数据归纳，尚未做统计聚类验证

### 修改 3：FAQ 新增两条 (第 400 行后)

**Q: Can 10 dimensions really generalize across roles?**

回答要点：Core dimensions 是 transferable cognitive abilities 而非 job-specific checklists。覆盖约 80% 跨岗位信号。系统支持 Role Overlay Generator，从面试数据中自动派生岗位维度，映射回 Core 保证可比性。

**Q: How do you generate role-specific overlays without predefined templates?**

回答要点：三步流程（提取 -> 聚合高频模式 -> 生成命名维度）+ 三个护栏（数量上限、强制映射、证据约束）+ 预置 Domain Pack 作为候选池。Web retrieval is an optional augmentation layer, not a dependency.

### 修改 4：更新 FAQ 第一条 (第 385-386 行)

将 "Human-in-the-loop 质量审计" 改为与 4.6 节一致的描述：架构内置质量保障（Schema Validation + Evidence-Based Scoring + Bounded Rubric + Cross-Layer Consistency）。

## 不改的部分

- 三层 Agent 架构图（4.1）不变
- 数据流设计（4.2）不变，但 Overlay 的数据流自然融入 Layer 2
- 其他 Trade-offs（1-4、6）不变
- Impact & Learnings 不变

