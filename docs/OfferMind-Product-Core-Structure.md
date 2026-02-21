# OfferMind 产品核心结构（AI PM 面试版）

---

## 1️⃣ Problem（痛点）

求职者在面试过程中积累了大量经验，但这些经验是**碎片化、主观化、不可复用的**。

- **面试完就忘**：每轮面试的问题、反馈、表现细节随时间迅速消散，无法形成系统性记忆
- **无法量化成长**：候选人凭"感觉"判断自己是否进步，缺少客观的能力追踪机制
- **复盘流于表面**：传统笔记式复盘（"感觉还行"/"答得不好"）缺乏结构化分析，无法指导下一轮准备
- **跨岗位经验断裂**：面 Google 和面字节的经验无法互相迁移，每次都从零开始
- **决策盲区**：当多个 Offer 同时到来时，候选人缺乏基于自身成长数据的理性决策框架

> 市面上的求职工具解决的是 **"状态追踪"** 问题（投了哪些公司、到了哪一轮）。  
> 但没有人解决 **"认知自己"** 的问题——我到底在哪些能力上真正成长了？

---

## 2️⃣ Insight（洞察）

**面试不应该是一次性事件，而应该是可复用的职业数据资产。**

每一场面试都包含丰富的信号：
- 面试官关注了哪些能力维度？
- 我在哪些维度表现稳定，哪些反复暴露短板？
- 跨公司、跨岗位的能力趋势是什么？

这些信号如果被结构化提取、跨时间聚合、智能分析，就能从"一堆面试经历"变成**个人职业成长的数据引擎**。

核心洞察：
> 求职不是一个 **追踪问题**，而是一个 **决策质量问题**。  
> 帮候选人做出不会后悔的职业决策，比帮他们通过下一轮面试更有价值。

---

## 3️⃣ Why AI（为什么必须是 AI，而不是规则系统）

这是一个**只有 AI 才能解决**的问题，规则系统根本无法胜任。原因有三：

### 3.1 输入是非结构化的、充满噪音的

面试笔记的真实形态：
- 中英混杂（"面试官问了一个 system design 的题，我答得还行但 trade-off 没讲清楚"）
- 口语化、碎片化、没有统一格式
- 同一个问题可能被描述为"产品设计题"、"product sense question"、"他让我设计一个产品"

规则系统无法处理这种语义多样性。你需要一个能理解自然语言语义的模型来做**问题提取、分类和质量评估**。

### 3.2 评估维度需要跨上下文推理

评估一个人的"产品思维"不是关键词匹配——你需要理解：
- 候选人是否从用户需求出发？
- 是否考虑了优先级和 trade-off？
- 是否用数据支撑决策？

这种**推理链条**只有大语言模型能完成。规则系统只能做 keyword → score 的映射，无法理解语义深度。

### 3.3 纵向模式识别需要长上下文窗口

Career Growth Agent 需要同时处理用户 3-6 个月内、跨 5-10 个岗位的所有面试数据，识别：
- 能力演化趋势（是渐进提升还是突然跃迁？）
- 持续短板 vs 临时波动
- 跨公司的能力迁移模式

这需要**长上下文推理能力**（token window > 100k），不是任何规则引擎可以实现的。

### 3.4 为什么不用 Fine-tuning？

| 考虑因素 | 分析 |
|---------|------|
| **数据量不足** | 面试分析是低频场景，每个用户产生的数据量级（几十到几百条）远不足以支撑 fine-tuning |
| **领域漂移快** | 面试趋势、公司考察重点每季度变化，fine-tuned 模型会快速过时 |
| **Prompt Engineering 已够用** | 通过精心设计的 System Prompt + 严格的 JSON Schema 约束，base model 已能稳定输出高质量结构化结果 |
| **成本不合理** | 为一个垂直场景维护 fine-tuned model 的 infra 成本远超 prompt-based 方案 |

> **决策原则**：在 Prompt Engineering 能达到 90%+ 质量的情况下，不应引入 fine-tuning 的复杂性。

---

## 4️⃣ System Design（Agent 架构 / 数据流 / 技术选型）

### 4.1 三层 Agent 架构

```
Raw Input (面试笔记/转录/PDF)
        │
        ▼
┌─────────────────────────┐
│  Layer 1: Interview     │  单轮面试 → 结构化数据
│  Analysis Agent         │  输出: 问题列表 + 10维评分 + SWOT
└────────────┬────────────┘
             │ 结构化 JSON
             ▼
┌─────────────────────────┐
│  Layer 2: Role Debrief  │  多轮聚合 → 岗位级洞察
│  Agent                  │  输出: 热力图 + 面试官画像 + 录用概率
└────────────┬────────────┘
             │ 聚合数据
             ▼
┌─────────────────────────┐
│  Layer 3: Career Growth │  跨岗位 → 职业演化智能
│  Intelligence Agent     │  输出: 趋势曲线 + 转折点 + 成长路线图
└─────────────────────────┘
```

### 4.2 数据流设计

**关键设计原则：Layer N 的输出是 Layer N+1 的输入。**

- Layer 1 输出严格遵循 JSON Schema（10 维评分 + 证据引用），确保 Layer 2 可以直接消费
- Layer 2 聚合多个 Layer 1 输出，生成岗位级的能力热力图和趋势
- Layer 3 跨所有 Layer 2 输出，做时间序列分析

这种**数据可组合性**是整个架构的生命线——任何一层的输出格式不稳定，整个管线就会崩溃。

### 4.3 模型选型：为什么选 Gemini 3 Flash

| 需求 | Gemini 3 Flash 的优势 |
|------|---------------------|
| 长上下文推理 | 支持超长 token window，能一次性处理多轮面试的完整历史 |
| 结构化输出 | 在严格 JSON Schema 约束下输出稳定性高 |
| 多模态输入 | 支持 PDF/图片解析，用户可以直接上传面试笔记截图 |
| 中英双语 | 原生支持中英混合输入，不需要额外的翻译层 |
| 成本效率 | Flash 版本在保持质量的同时显著降低延迟和成本 |

**为什么不用多模型组合？** → 见 Trade-offs 第 1 点。

### 4.4 Evidence-Based Scoring 机制

**核心问题**：AI 打分如果没有依据，用户不信任。

**解决方案**：所有评分必须附带原文证据引用。

```json
{
  "competency": "product_sense",
  "score": 4,
  "evidence": "候选人在回答产品设计题时，首先明确了目标用户群体（应届生 vs 在职），然后从用户痛点出发提出了3个解决方案，并用 DAU/留存率作为成功指标进行优先级排序。",
  "gap": "未讨论竞品分析和差异化定位"
}
```

这个机制从**架构层面**解决了 AI 幻觉问题——不是靠 post-hoc 检查，而是在 prompt 设计中就要求模型"先找证据，再打分"。

### 4.5 防幻觉策略（How I Prevent Hallucination）

| 策略 | 实现方式 |
|------|---------|
| **Evidence-First Prompting** | System Prompt 要求模型先引用原文，再给出评分，颠倒了"先判断后找理由"的幻觉模式 |
| **Strict JSON Schema** | 输出必须符合预定义的 Schema，任何不合规的字段会被前端拒绝，防止模型"自由发挥" |
| **Bounded Scoring** | 评分限定在 1-5 整数范围，附带明确的评分标准（rubric），减少模型的主观发挥空间 |
| **Input Grounding** | 所有分析必须基于用户提供的原始文本，prompt 中明确禁止"推测未提供的信息" |
| **Cross-Layer Validation** | Layer 2 的聚合分析可以与 Layer 1 的单轮数据交叉验证，发现不一致时标记 |

### 4.6 如何评估模型质量（Model Quality Evaluation）

**当前方法**：架构内置的质量保障机制

1. **Strict JSON Schema Validation**：每个 Agent 的输出必须通过前端 Schema 校验，不合规的响应直接拒绝并重试——这是线上质量的第一道防线
2. **Evidence-Based Scoring 自验证**：评分必须附带原文引用，如果模型无法从原文中找到证据就无法给高分，从 prompt 层面约束了输出质量
3. **Bounded Scoring Rubric**：1-5 分的评分标准明确定义了每个分数对应的行为描述，减少模型的自由裁量空间
4. **Cross-Layer Consistency Check**：Layer 2 聚合 Layer 1 数据时，如果单轮评分与聚合趋势严重矛盾，系统会标记异常

**未来方向**：
- 引入 LLM-as-Judge 自动评估 pipeline，用更强的模型（如 Gemini Pro）对 Flash 输出做质量打分
- 增加用户反馈机制（修改 AI 评分 / 满意度评分），用修改率作为模型不准确率的代理指标
- 构建 Golden Set 回归测试集，每次 prompt 迭代后自动化对比

---

## 5️⃣ Key Product Decisions（关键产品决策）

### 决策 1：10 维能力框架的标准化

**问题**：面试能力维度如何定义？不同公司、不同岗位的考察维度差异很大。

**决策**：设计一套跨公司、跨岗位通用的 10 维能力框架：

| 维度 | 覆盖范围 |
|------|---------|
| Product Sense | 用户思维、需求分析、产品直觉 |
| Execution | 项目推进、优先级管理、落地能力 |
| Analytics & Metrics | 数据驱动决策、指标设计 |
| Communication | 表达清晰度、说服力、跨团队协作 |
| Technical Depth | 技术理解深度、系统思维 |
| AI/ML Skills | AI 应用能力、模型理解 |
| System Design | 架构设计、可扩展性思维 |
| Business Strategy | 商业模式、市场分析、战略思维 |
| Leadership | 主动性、团队影响力、ownership |
| Stress Resilience | 压力下的表现、适应性 |

**为什么是 10 维而不是 5 维或 20 维？**
- 5 维太粗：无法区分"技术好但沟通差"和"技术好但缺领导力"
- 20 维太细：增加 AI 评分负担，维度间重叠导致信噪比下降
- 10 维是**认知负荷和分析粒度的最佳平衡点**

### 决策 2：Pattern-over-Event 逻辑

**问题**：用户面完一轮表现很差，系统应该如何反应？

**决策**：系统优先识别**跨时间模式**，避免因单次面试表现产生过度反应。

- 单次低分不触发"短板"警告，只有**连续 2+ 次同维度低分**才标记为"持续短板"
- Career Growth Agent 区分"临时波动"和"结构性问题"
- 给用户的建议基于趋势而非快照

**理由**：面试表现本身就有高方差（面试官风格、当天状态、题目难度都是混淆变量）。如果系统对单次事件过度反应，会损害用户信任。

### 决策 3：录用概率预测的谨慎设计

**问题**：用户强烈想知道"我能不能拿到 offer"，但预测准确率永远不可能高。

**决策**：
- 提供 Low / Medium / High 三级预测（不给百分比，避免虚假精确感）
- 附带**置信度**和 **3 条具体理由**
- UI 上用"参考信号"而非"预测结果"的措辞

**理由**：给百分比（如"72% 概率拿 offer"）会让用户误以为这是精确预测。三级分类 + 理由的方式既满足用户需求，又管理了预期。

### 决策 4：中英双语全链路支持

**问题**：目标用户群体同时包含中文求职者（国内大厂）和英文求职者（Google/Meta）。

**决策**：
- 输入层：支持中英混合输入（"面试官问了一道 product sense 题"）
- AI 层：通过 System Prompt 的 language 参数控制输出语言
- UI 层：使用 i18next 实现完整的界面国际化

**挑战**：中英混合输入是最难处理的场景——用户可能在一段笔记中反复切换语言。Gemini 3 的原生多语言能力在这里是关键优势。

---

## 6️⃣ Trade-offs（权衡取舍）⭐

> *这一部分是 AI PM 面试中最能拉开差距的环节。每个 trade-off 都展示了你在真实约束下做出合理决策的能力。*

### Trade-off 1：单模型 vs 多模型

| 方案 | 优势 | 劣势 |
|------|------|------|
| **单模型（Gemini 3 Flash）** ✅ 采用 | 架构简单，无模型间协调开销；统一的 prompt 风格；部署和维护成本低 | 单点故障风险；某些维度可能不如专用模型精准 |
| **多模型组合** | 每个 Agent 用最优模型（如 GPT-5 做推理 + Gemini 做多模态） | 编排复杂度高；模型间输出格式不一致；成本和延迟叠加；调试难度指数级增长 |

**我的决策**：选择单模型，因为在当前阶段，**降低系统复杂度的价值 > 追求每个维度的最优精度**。

**决策边界**：如果未来某个 Agent（如 Career Growth）的分析质量显著低于预期，且 prompt 优化已触及天花板，才考虑引入第二个模型。

### Trade-off 2：精度 vs 成本

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Pro 模型（高精度）** | 更强的推理能力，更少的幻觉 | 单次请求成本高 3-5x；延迟增加 2-3x |
| **Flash 模型（平衡）** ✅ 采用 | 成本低、速度快、质量在可接受范围内 | 复杂推理场景偶尔出错 |

**我的决策**：Flash + 精心设计的 prompt > 简单 prompt + Pro 模型。

**关键 insight**：**Prompt quality is a stronger lever than model size**。通过 Evidence-Based Prompting、Strict Schema、Bounded Scoring 三重约束，Flash 模型的输出质量可以逼近 Pro 模型，但成本只有 1/5。

**失败案例**：早期使用 Pro 模型时，因为 prompt 设计不够严格，输出质量反而不如后来优化过的 Flash prompt。这验证了"prompt 质量 > 模型大小"的判断。

### Trade-off 3：深度分析 vs 实时速度

| 方案 | 优势 | 劣势 |
|------|------|------|
| **深度分析（更长 prompt + 更多维度）** ✅ 采用 | 用户获得全面、可操作的洞察 | 响应时间 8-15 秒 |
| **实时分析（精简 prompt + 少量维度）** | 响应 < 3 秒，体验流畅 | 分析深度不足，用户觉得"不如自己想的" |

**我的决策**：面试分析是一个**低频、高价值**的场景。用户一周可能只分析 1-3 次面试，但每次都期望获得深度洞察。在这个场景下，**10 秒等待换取高质量分析是可接受的 trade-off**。

**UX 补偿**：用 loading animation + 分步进度提示（"正在提取问题..."、"正在评估能力维度..."）让等待感知时间缩短。

### Trade-off 4：自由生成 vs 结构化输出

| 方案 | 优势 | 劣势 |
|------|------|------|
| **自由文本生成** | AI 可以更灵活地表达，覆盖意外洞察 | 输出不可预测，前端无法稳定渲染；Layer 间数据无法自动流转 |
| **严格 JSON Schema** ✅ 采用 | 输出稳定，前端可靠渲染；Layer 间数据自动组合 | 可能遗漏 Schema 外的有价值信息 |

**我的决策**：在多 Agent 管线中，**数据可组合性 > 表达灵活性**。

如果 Layer 1 的输出格式不稳定，Layer 2 就无法自动消费。一个"偶尔输出很精彩但格式不可靠"的系统，不如一个"每次输出 80 分但格式 100% 可靠"的系统。

**补偿机制**：在 Schema 中保留 `additionalNotes` 字段，让 AI 可以在结构化框架内自由补充洞察。

### Trade-off 5：通用能力框架 vs 岗位定制框架

| 方案 | 优势 | 劣势 |
|------|------|------|
| **通用 10 维框架** ✅ 采用 | 跨岗位可对比，数据可聚合 | 某些岗位的核心能力可能被"稀释" |
| **岗位定制框架** | 针对性更强（SDE 有 coding 维度，PM 有 product sense） | 跨岗位无法对比，Career Growth Agent 失效 |

**我的决策**：Career Growth Agent 的核心价值在于**跨岗位的纵向对比**。如果每个岗位用不同的框架，Layer 3 的分析就失去意义。

**妥协方案**：在通用框架基础上，Role Debrief Agent 可以**动态加权**——PM 岗位中 product_sense 权重更高，SDE 岗位中 technical_depth 权重更高。框架统一，权重灵活。

### Trade-off 6：Bias 问题的处理

**问题**：AI 评分是否会有系统性偏见？（如对英文表达更好的用户给更高分）

**当前策略**：
- Evidence-Based Scoring 减少主观判断空间——分数必须基于原文证据，不基于"印象"
- 评分 rubric 明确化——每个分数对应具体行为描述，而非模糊的"好/中/差"
- 中英双语独立评估——同一维度的中文和英文评分标准一致

**诚实承认的局限**：
- 模型可能对更结构化的回答给更高分（即使内容深度相同）
- 缺乏大规模 A/B 测试来量化 bias 程度
- 这是一个**持续监控**的问题，不是一次性解决的

---

## 7️⃣ Impact & Learnings（结果与学习）

### 用户反馈

> *"以前面完试就忘了，现在每次面试都变成了我能力提升的数据点。"*  
> — 目标 Google PM 的应届求职者

> *"Role Debrief 让我第一次清楚地看到面试官到底在考察什么，不用再猜了。"*  
> — 准备跳槽的在职产品经理

> *"Career Growth 的能力演化曲线让我意识到，我的沟通能力一直在进步，但系统设计是持续短板——这个发现改变了我的准备策略。"*  
> — 经历 8 轮面试的候选人

### 数据

| 指标 | 结果 |
|------|------|
| AI Agent 数量 | 6 个独立 Agent，覆盖从单轮解析到职业成长的完整链路 |
| 能力评估维度 | 10 维标准化框架，支持跨公司、跨岗位横向对比 |
| 语言支持 | 中英双语全覆盖（输入 + 输出 + UI） |
| 架构层级 | 3 层智能（面试 → 岗位 → 职业），信号逐层聚合 |
| Schema 合规率 | > 95%（严格 JSON Schema 约束） |
| 技术栈 | React + TypeScript + Supabase + Gemini 3 API，全栈一人完成 |

### Key Learnings

#### Learning 1：用户信任 AI 的前提是可解释性

早期版本的 AI 输出虽然"看起来专业"，但用户不信任没有依据的评分。引入 Evidence-Based Scoring 后，用户接受度显著提升——每个分数背后都有原文引用，AI 不再是黑盒。

**Takeaway**: In AI products, **explainability is not a nice-to-have, it's a trust prerequisite**.

#### Learning 2：Prompt Quality > Model Size

最反直觉的发现：通过精心设计的 prompt（Evidence-First、Schema 约束、Bounded Scoring），Flash 模型的输出质量可以逼近甚至超过使用简单 prompt 的 Pro 模型。

**Takeaway**: Before upgrading to a more expensive model, **exhaust prompt engineering first**.

#### Learning 3：长期价值来自模式识别，而非单次反馈

单轮面试分析的价值有上限。真正让用户产生"啊哈时刻"的是跨岗位的能力趋势——发现自己在产品思维上持续进步，但在系统设计上始终原地踏步。

**Takeaway**: The most valuable AI insight is **longitudinal pattern**, not **point-in-time assessment**.

#### Learning 4：结构化输出是多 Agent 系统的生命线

6 个 Agent 的所有输出都遵循严格的 JSON Schema。这不仅保证了可视化层的稳定性，更让整个系统具备了"数据可组合性"——Layer 1 的输出直接喂给 Layer 2，Layer 2 喂给 Layer 3，形成真正的智能管线。

**Takeaway**: In multi-agent systems, **composability trumps flexibility**.

#### Learning 5：最好的 AI 系统增强人类判断力，而不是替代它

OfferMind 不承诺"用了就能拿 Offer"，而是帮用户建立**决策框架**——基于数据而非焦虑做出职业选择。这种诚实定位反而赢得了更深的用户信任。

**Takeaway**: **Augment human judgment, don't replace it.**

---

## 🔮 未来扩展方向

| 方向 | 描述 | 前提条件 |
|------|------|---------|
| **LLM-as-Judge 自动评估** | 用更强的模型自动评估 Flash 输出质量，替代人工抽检 | 需要构建 golden set + 评估 prompt |
| **Offer Comparison Agent** | 当用户同时拿到多个 offer 时，基于成长数据提供理性决策建议 | 需要足够的 Layer 3 数据积累 |
| **团队版 / B2B** | 帮公司追踪候选人面试质量趋势（面试官视角） | 需要重新设计数据模型和权限体系 |
| **Voice Input** | 支持语音输入面试记录，降低使用门槛 | Gemini 多模态能力已支持，需前端集成 |
| **Fine-tuning（条件触发）** | 当数据量足够且 prompt 优化触及天花板时，考虑为特定 Agent fine-tune | 需要 1000+ 高质量标注样本 |

---

## 🛡️ 面试追问准备（FAQ）

### Q: How do you evaluate model quality?
Human-in-the-loop 质量审计 + Golden Set 回归测试 + Schema 合规率监控 + 用户修改率追踪。详见 4.6 节。

### Q: How do you prevent hallucination?
五重防线：Evidence-First Prompting → Strict Schema → Bounded Scoring → Input Grounding → Cross-Layer Validation。详见 4.5 节。

### Q: How do you handle bias?
Evidence-Based Scoring 限制主观空间 + 明确评分 rubric + 中英独立标准。诚实承认缺乏大规模 A/B 测试。详见 Trade-off 6。

### Q: What if your scoring is wrong?
这是必然会发生的。策略是：1) 鼓励用户修改 AI 评分（修改率是质量信号）；2) Pattern-over-Event 逻辑降低单次错误的影响；3) 持续迭代 prompt 缩小误差。

### Q: Why not fine-tune?
数据量不足 + 领域漂移快 + Prompt Engineering 已达到可接受质量 + 维护成本不合理。详见 3.4 节。

### Q: What is your moat?
短期：Evidence-Based 分析框架 + 多层 Agent 的数据可组合性。中期：用户积累的纵向面试数据（数据网络效应——用得越久越精准）。长期：品类定义——从"求职工具"到"职业智能"的认知占位。

---

*Built by a solo developer. Full-stack. AI-first. From zero to production.*
