

# 更新文档：明确 Overlay → Backbone 映射是动态的、证据驱动的

## 问题

当前文档第 214-216 行的示例中，Overlay 的映射关系看起来像是"预设"的（如 Reliability → System Thinking + Technical Fluency + Execution），但没有解释**为什么映射到这些 Backbone 维度**、**映射逻辑是什么**。读者会产生疑问："为什么 API Abstraction 不映射 Technical Fluency？谁决定的？"

## 修改内容

### 修改 1：在 Step C 后新增"映射机制"说明（第 209 行之后）

在 3 步生成流程和示例之间，插入一段专门解释映射逻辑的内容：

**Step D - 动态映射（Evidence-Driven Mapping）**

说明：
- 映射不是预设的静态表，而是 AI Generator 基于**证据内容**动态决定的
- 映射逻辑：分析每个 Overlay 维度下的证据片段，判断这些证据实际体现了哪些 Backbone 认知能力
- 同一个 Overlay（如 API Abstraction）在不同候选人身上可能映射到不同的 Backbone 维度，取决于面试中实际考察的角度

给出映射判定规则：
- 看**证据内容**，不看维度名称。"API Abstraction" 如果证据是关于模块拆分和接口契约 → Structured Thinking + Communication；如果证据是关于底层协议选择和性能权衡 → Technical Fluency + System Thinking
- 每个映射必须附带**证据引用**（哪道题、哪段回答支撑了这个映射）
- 映射是"一对多"（1 个 Overlay → 1-3 个 Backbone）且因人而异

### 修改 2：更新示例部分（第 211-216 行）

在现有示例旁边加注释，说明映射是动态结果而非固定规则：

- 强调"以下映射是基于该候选人 5 轮面试的具体证据生成的，不同候选人 / 不同面试内容可能产生不同映射"
- 给出一个对比示例：同样是 "API Abstraction & Boundaries"，如果候选人面试中重点讨论了技术协议选择，映射会变成 Technical Fluency + System Thinking（而非 Structured Thinking + Communication）

### 修改 3：更新护栏表格中的"强制映射"行（第 228 行）

将描述从"每个 Overlay 必须绑定 1-3 个 Core Backbone 维度"扩展为：
- "每个 Overlay 必须由 AI Generator 基于证据内容动态绑定 1-3 个 Core Backbone 维度，映射结果因候选人面试证据不同而不同"

## 技术细节

- 仅修改 `docs/OfferMind-Product-Core-Structure.md` 一个文件
- 3 处修改集中在第 201-230 行区域
- 不涉及代码或数据库变更

