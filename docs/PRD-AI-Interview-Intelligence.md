# 🧠 CareerPilot AI Interview Intelligence System — PRD

> **Document Version**: 1.0  
> **Last Updated**: 2025-02-06  
> **Author**: Product & AI Architecture Team

---

## 1️⃣ Product Overview

### 产品名称
**CareerPilot AI Interview Intelligence System**

### 目标用户
- **求职者 / 高潜人才**：正在进行多轮面试的求职者
- **海外留学生**：中美双向求职，需要跨语言面试复盘
- **职业转型者**：需要系统化提炼能力信号的候选人

### 核心痛点

| 痛点 | 现状 | CareerPilot 解决方案 |
|------|------|---------------------|
| 🔴 面试无法复盘 | 面试结束后只有模糊记忆，无法结构化分析 | AI 自动从 transcript 提取问题、评估质量 |
| 🔴 不知道失败原因 | 被拒后无法定位具体短板 | 能力热力图 + 风险信号识别 |
| 🔴 无法提炼能力信号 | 面试中表现分散，难以形成系统认知 | 多轮汇总生成 Role Debrief |
| 🔴 岗位匹配不精准 | 不清楚公司最看重什么 | Hiring Likelihood + Company Insights |

---

## 2️⃣ System Architecture ⭐⭐⭐⭐⭐

### Agent Workflow（Two-Layer Architecture）

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: Interview Round Agent               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input (Raw Transcript)                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Transcript Analyzer Agent                           │      │
│  │  ├─ Speaker Role Detection (Interviewer vs Candidate)│      │
│  │  ├─ Question Extraction & Deduplication              │      │
│  │  ├─ Category Classification (6 types)                │      │
│  │  ├─ Response Quality Scoring (High/Medium/Low)       │      │
│  │  └─ Reflection Generation                            │      │
│  └──────────────────────────────────────────────────────┘      │
│       │                                                         │
│       ▼                                                         │
│  Structured Round Analysis (JSON)                               │
│  ├─ questions[] with quality scores                             │
│  ├─ reflection{} with actionable insights                       │
│  └─ metadata{} with language detection                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Requires ≥2 Rounds)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 2: Role Debrief Agent                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Multi-Round Analysis Data                                      │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Role Debrief Aggregator Agent                       │      │
│  │  ├─ Interviewer Profiling (infer background)         │      │
│  │  ├─ Competency Heatmap (10 dimensions × 5 levels)    │      │
│  │  ├─ Cross-Round Pattern Recognition                  │      │
│  │  ├─ Hiring Likelihood Prediction                     │      │
│  │  └─ Next Best Actions Generation                     │      │
│  └──────────────────────────────────────────────────────┘      │
│       │                                                         │
│       ▼                                                         │
│  Role-Level Intelligence (JSON)                                 │
│  ├─ interviewerMapping[] per round                              │
│  ├─ competencyHeatmap{} with evidence                           │
│  ├─ hiringLikelihood{} with confidence score                    │
│  └─ nextBestActions[] prioritized                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Decision Matrix

| 维度 | 决策 | 理由 |
|------|------|------|
| **Agent Type** | Single Agent per Layer | 每层任务边界清晰，无需多 agent 协作 |
| **Planner / Executor** | ❌ 不需要 | 任务为单次推理，无需动态规划 |
| **Tool Use** | ❌ 不需要 | 纯推理任务，无需外部工具调用 |
| **Memory** | ✅ Stateless + DB Persistence | 分析结果持久化到数据库，支持长期回顾 |
| **Multi-Modal** | ❌ Text Only | 当前仅处理 transcript 文本 |

---

## 3️⃣ Model Strategy ⭐⭐⭐⭐⭐

### Model Selection Rationale

```
┌─────────────────────────────────────────────────────────────────┐
│                    Model Routing Strategy                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Task Type              Model               Rationale           │
│  ─────────────────────────────────────────────────────────────  │
│  Transcript Analysis    Gemini 3 Flash      ✅ Long context     │
│  (Layer 1)                                  ✅ Fast response    │
│                                             ✅ Bilingual (CN/EN)│
│                                             ✅ Structured output│
│                                                                 │
│  Role Debrief           Gemini 3 Flash      ✅ Multi-round      │
│  (Layer 2)                                     aggregation      │
│                                             ✅ Reasoning depth  │
│                                             ✅ Evidence-based   │
│                                                                 │
│  Mock Interview         Gemini 3 Flash      ✅ Streaming        │
│  (Interactive)          + Stream Mode       ✅ Conversational   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Gemini 3 Flash?

| 需求 | Gemini 3 Flash | GPT-4 | Claude 3 |
|------|---------------|-------|----------|
| **长上下文** (面试 transcript 5000+ tokens) | ✅ 1M tokens | ✅ 128K | ✅ 200K |
| **中英双语** | ✅ 原生支持 | ⚠️ 需额外调优 | ✅ 良好 |
| **结构化输出** | ✅ 稳定 | ✅ 稳定 | ⚠️ 偶有格式问题 |
| **成本效率** | ✅ 最优 | ❌ 贵 | ⚠️ 中等 |
| **响应速度** | ✅ 快 | ⚠️ 中等 | ✅ 快 |

**Model Routing 语句**:
> "We use dynamic model routing: Gemini Flash for high-volume transcript analysis optimizing cost-latency, with potential upgrade path to Gemini Pro for complex multi-round reasoning if accuracy requires."

---

## 4️⃣ Prompt Engineering Strategy ⭐⭐⭐⭐

### Layer 1: Transcript Analyzer Prompt Design

```typescript
// System Prompt 核心设计原则
const SYSTEM_PROMPT = `You are an expert interview analysis assistant...

=== Anti-Hallucination Strategies ===
1. "Identify interviewer questions vs candidate responses"
   → 强制区分角色，避免混淆
   
2. "Merge repeated or rephrased questions into one canonical question"
   → 去重逻辑，减少重复输出
   
3. "Assess the candidate's response quality based on context clues"
   → 基于证据评估，而非主观臆断
   
4. "Be constructive and growth-oriented, never harsh"
   → Tone control，确保输出可用于用户展示

=== Structured Output Enforcement ===
- Return your analysis as JSON with this exact structure...
- temperature: 0.3 (低温度确保一致性)
`;
```

### Layer 2: Role Debrief Prompt Design

```typescript
// Evidence-Based Reasoning 设计
const SYSTEM_PROMPT = `You are a Career Coach AI...

=== Competency Scoring Protocol ===
"Score these competencies (1-5) based on evidence"
→ 强制要求 evidence 字段，避免无依据评分

=== Hiring Likelihood Calibration ===
"confidence: 0-1 score"
"reasons: 3 bullet points explaining the assessment"
→ 量化置信度 + 可解释性

=== Actionable Output ===
"nextBestActions: specific actionable preparation items"
"priority: high|medium|low"
"targetGap: string"
→ 行动导向，而非泛泛建议
`;
```

### Prompt Design Techniques Used

| 技术 | 应用位置 | 效果 |
|------|----------|------|
| **Role Setting** | "You are an expert interview analysis assistant" | 建立专业 persona |
| **Structured Output Schema** | JSON schema 嵌入 prompt | 100% 格式可控 |
| **Low Temperature** | `temperature: 0.3` (Layer 1) | 结构化输出稳定性 |
| **Evidence Requirement** | `{ score: 1-5, evidence: "string" }` | 降低 hallucination |
| **Explicit Constraints** | "Be constructive, never harsh" | Tone control |

---

## 5️⃣ Output Schema ⭐⭐⭐⭐⭐

### Layer 1: Transcript Analysis Output

```json
{
  "questions": [
    {
      "question": "Tell me about a time you had to influence without authority",
      "category": "behavioral",
      "myAnswerSummary": "Used cross-functional project example, stakeholder mapping",
      "evaluationFocus": "Leadership & influence skills",
      "responseQuality": "high",
      "qualityReasoning": "Provided specific metrics and stakeholder names",
      "difficulty": 4,
      "tags": ["leadership", "stakeholder-management", "influence"]
    }
  ],
  "reflection": {
    "overallFeeling": "good",
    "performanceSummary": "Strong performance on behavioral questions...",
    "whatWentWell": ["Clear STAR structure", "Quantified impact"],
    "whatCouldImprove": ["Could probe deeper on technical trade-offs"],
    "keyTakeaways": ["Company values cross-functional collaboration"],
    "interviewerVibe": "Friendly but probing, focused on leadership signals",
    "companyInsights": "Team is scaling rapidly, seeking senior IC leadership"
  },
  "metadata": {
    "totalQuestions": 8,
    "dominantCategory": "behavioral",
    "overallDifficulty": "medium-hard",
    "languageDetected": "mixed (Chinese/English)"
  }
}
```

### Layer 2: Role Debrief Output

```json
{
  "interviewerMapping": [
    {
      "roundId": "uuid",
      "roundName": "HM Round",
      "interviewerBackground": "Engineering Manager, 5+ years at company",
      "focusDimensions": ["Technical Depth", "System Design"],
      "highlight": "Strong system design answer with clear trade-offs",
      "risk": "Lacked depth on ML infrastructure specifics"
    }
  ],
  "competencyHeatmap": {
    "product_sense": { "score": 4, "evidence": "Strong user-centric thinking in Round 2" },
    "execution": { "score": 5, "evidence": "Demonstrated shipping complex features" },
    "analytics_metrics": { "score": 3, "evidence": "Basic metrics understanding, room for growth" },
    "communication": { "score": 4, "evidence": "Clear articulation across all rounds" },
    "technical_depth": { "score": 3, "evidence": "Adequate but not exceptional" },
    "AI_skills": { "score": 4, "evidence": "Good LLM application understanding" },
    "system_design": { "score": 4, "evidence": "Solid architecture discussion" },
    "business_strategy": { "score": 3, "evidence": "Limited strategic questions" },
    "leadership": { "score": 5, "evidence": "Consistent leadership examples" },
    "stress_resilience": { "score": 4, "evidence": "Handled pressure questions well" }
  },
  "keyInsights": {
    "careMost": ["Technical depth in AI/ML", "Cross-functional leadership"],
    "strengths": ["Leadership narrative", "Structured communication"],
    "risks": ["Technical depth gap in ML infra", "Strategy thinking"]
  },
  "hiringLikelihood": {
    "level": "Medium",
    "confidence": 0.65,
    "reasons": [
      "Strong leadership signal but technical gap in core area",
      "Company prioritizes ML depth which is a weak point",
      "Good culture fit signals from interviewer vibes"
    ]
  },
  "nextBestActions": [
    { "action": "Deep dive ML infrastructure patterns", "priority": "high", "targetGap": "technical_depth" },
    { "action": "Prepare 2 more AI product case studies", "priority": "high", "targetGap": "AI_skills" },
    { "action": "Research company's recent AI initiatives", "priority": "medium", "targetGap": "business_strategy" }
  ],
  "roleSummary": "Strong candidate with excellent leadership signals. Primary risk is technical depth in ML infrastructure, which the company heavily weights. Recommend focused preparation on system design for ML workloads before final round."
}
```

---

## 6️⃣ Precision Optimization Strategy ⭐⭐⭐⭐⭐

### Current Implementation

| 策略 | 状态 | 实现方式 |
|------|------|----------|
| **Contextual Grounding** | ✅ 已实现 | Company/Role/Stage 作为 prompt context |
| **Evidence-Based Scoring** | ✅ 已实现 | 每个 competency 需提供 evidence |
| **Multi-Round Aggregation** | ✅ 已实现 | Layer 2 聚合多轮数据 |
| **Confidence Calibration** | ✅ 已实现 | hiringLikelihood.confidence: 0-1 |

### Future Enhancement Roadmap

```
Phase 1: RAG Enhancement
├─ JD Vector Store (embed job descriptions)
├─ Skill Ontology (standardized competency taxonomy)
└─ Semantic Matching (candidate strength → JD requirement)

Phase 2: Calibration Scoring
├─ Historical Success Rate (similar profiles → outcome)
├─ Company-Specific Benchmarks (what does "high" mean at Google vs startup?)
└─ Industry Normalization

Phase 3: Advanced Retrieval
├─ Interview Question Bank (similar questions → expected answers)
├─ STAR Story Retrieval (candidate's past stories → best match)
└─ Cross-Company Pattern Recognition
```

### Precision Optimization Techniques

```typescript
// 未来 RAG 架构设计
const precisionPipeline = {
  // Step 1: JD Embedding
  jdEmbedding: "Embed JD into vector store for semantic matching",
  
  // Step 2: Skill Ontology
  skillOntology: {
    "product_sense": ["user_research", "prioritization", "roadmapping"],
    "technical_depth": ["system_design", "coding", "ML_fundamentals"],
    // ... standardized skill taxonomy
  },
  
  // Step 3: Calibration
  calibration: {
    scoreNormalization: "Adjust scores based on company tier",
    historicalBenchmark: "Compare with similar successful candidates",
  }
};
```

---

## 7️⃣ Evaluation Framework ⭐⭐⭐⭐⭐

### Metrics Definition

| Metric | Definition | Measurement |
|--------|------------|-------------|
| **Accuracy** | Question extraction matches ground truth | Manual review sampling |
| **Consistency** | Same input → same output | Multi-run comparison |
| **Decision Usefulness** | Insights lead to better prep | User outcome tracking |
| **Latency** | Time from input to output | p50/p95 response time |

### Evaluation Implementation

```typescript
// Automated Consistency Check
const consistencyTest = async (transcript: string) => {
  const results = await Promise.all([
    analyzeTranscript(transcript),
    analyzeTranscript(transcript),
    analyzeTranscript(transcript),
  ]);
  
  const questionCounts = results.map(r => r.questions.length);
  const variance = calculateVariance(questionCounts);
  
  return {
    consistent: variance < 0.1,
    questionCountVariance: variance,
  };
};

// Human-in-the-Loop Review
const humanReviewPipeline = {
  sampling: "10% of analyses flagged for review",
  reviewCriteria: [
    "Question extraction accuracy",
    "Quality scoring alignment",
    "Actionable insight quality",
  ],
  feedbackLoop: "Reviewer corrections → fine-tuning data",
};
```

### Evaluation Dashboard (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Quality Dashboard                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Weekly Metrics                                                 │
│  ├─ Total Analyses: 1,247                                       │
│  ├─ Avg Questions per Transcript: 7.3                           │
│  ├─ Quality Distribution: High 45% / Medium 42% / Low 13%       │
│  └─ User Satisfaction: 4.2/5                                    │
│                                                                 │
│  Consistency Score: 94.2%                                       │
│  Hallucination Rate: 2.1%                                       │
│  Latency p95: 3.2s                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8️⃣ Future Iteration Roadmap

### Phase 1: Core Enhancement (Q1)
- [ ] **RAG for JD Analysis** — Embed job descriptions for semantic skill matching
- [ ] **Skill Ontology** — Standardized competency taxonomy
- [ ] **Multi-Language Support** — Japanese, Korean

### Phase 2: Personalization (Q2)
- [ ] **Personalization Memory** — Track user's skill growth over time
- [ ] **STAR Story Library** — Index and retrieve user's best stories
- [ ] **Weakness Tracking** — Long-term gap closure monitoring

### Phase 3: Active Learning (Q3)
- [ ] **Mock Interview Simulation** — AI interviewer with real-time feedback
- [ ] **RLHF** — Reinforcement Learning from Human Feedback
- [ ] **A/B Testing Framework** — Prompt optimization with user outcomes

### Phase 4: Intelligence Network (Q4)
- [ ] **Cross-User Learning** — Anonymized pattern aggregation
- [ ] **Company Interview Patterns** — "What does Google typically ask?"
- [ ] **Outcome Prediction Model** — "Candidates with this profile have 73% offer rate"

---

## 📊 Summary: AI PM Differentiation Points

| 维度 | CareerPilot 实现 | 普通 PM 思维 |
|------|------------------|--------------|
| **架构** | Two-Layer Agent with clear boundaries | "用 GPT 调一下" |
| **模型选择** | Model routing with cost-latency optimization | "用最贵的模型" |
| **Prompt Design** | Evidence-based + structured output + tone control | "写个 prompt" |
| **Output Schema** | Typed JSON with confidence calibration | "让 AI 自由发挥" |
| **Evaluation** | Consistency + Accuracy + Decision Usefulness | "用户说好就行" |
| **Iteration** | RAG → RLHF → Cross-User Learning roadmap | "加功能" |

---

## 📎 Appendix: Technical Implementation Reference

### Edge Functions

| Function | Purpose | Model | Temperature |
|----------|---------|-------|-------------|
| `analyze-transcript` | Layer 1: Extract questions & reflection | Gemini 3 Flash | 0.3 |
| `generate-role-debrief` | Layer 2: Aggregate multi-round insights | Gemini 3 Flash | 0.7 |
| `interview-prep-agent` | Question prediction & mock interview | Gemini 3 Flash | 0.7 |

### Type Definitions

- `src/types/transcript-analysis.ts` — Layer 1 output types
- `src/types/role-debrief.ts` — Layer 2 output types
- `src/types/analytics.ts` — Analysis record persistence types

---

*This PRD demonstrates AI Product Management capabilities including LLM architecture design, model selection rationale, prompt engineering strategies, and evaluation frameworks.*
