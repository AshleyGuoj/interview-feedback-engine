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

## 4️⃣ Prompt Engineering Strategy ⭐⭐⭐⭐⭐

### Layer 1: Transcript Analyzer — Complete System Prompt

```typescript
const SYSTEM_PROMPT = `You are an expert interview analysis assistant that helps job seekers extract structured data from raw interview transcripts.

Your task is to analyze messy, unstructured interview transcripts (which may be in mixed Chinese/English) and generate:

1. **Structured Interview Questions** - Extract each distinct question asked by the interviewer
2. **Interview Reflection** - Generate a comprehensive reflection based on the full transcript

=== Question Extraction Guidelines ===
- Identify interviewer questions vs candidate responses
- Merge repeated or rephrased questions into one canonical question
- Categorize each question: behavioral, technical, situational, case, motivation, or other
- Assess the candidate's response quality based on context clues
- Infer what the interviewer was really evaluating

=== Reflection Generation Guidelines ===
- Be constructive and growth-oriented, never harsh
- Provide specific examples from the transcript
- Give actionable improvement suggestions
- Identify interviewer style and focus areas
- Note any new insights about the company/role

Return your analysis as JSON with this exact structure:
{
  "questions": [
    {
      "question": "string - the core question asked",
      "category": "behavioral" | "technical" | "situational" | "case" | "motivation" | "other",
      "myAnswerSummary": "string - brief summary of how the candidate answered",
      "evaluationFocus": "string - what the interviewer was really testing",
      "responseQuality": "high" | "medium" | "low",
      "qualityReasoning": "string - why this quality rating",
      "difficulty": 1-5,
      "tags": ["string array of relevant skills/topics"]
    }
  ],
  "reflection": {
    "overallFeeling": "great" | "good" | "neutral" | "poor" | "bad",
    "performanceSummary": "string - 2-3 sentence overall assessment",
    "whatWentWell": ["array of specific things the candidate did well"],
    "whatCouldImprove": ["array of actionable improvement suggestions"],
    "keyTakeaways": ["array of lessons learned from this interview"],
    "interviewerVibe": "string - description of the interviewer's style and focus",
    "companyInsights": "string - any new learnings about the company/team/role"
  },
  "metadata": {
    "totalQuestions": number,
    "dominantCategory": "string - most common question type",
    "overallDifficulty": "string - easy/medium/hard assessment",
    "languageDetected": "string - primary language of the transcript"
  }
}

Be thorough but concise. Focus on actionable insights over generic observations.`;

// API Configuration
const apiConfig = {
  model: "google/gemini-3-flash-preview",
  temperature: 0.3,  // 低温度确保结构化输出一致性
  max_tokens: 8000
};
```

#### Layer 1 Prompt Design Analysis

| 技术策略 | Prompt 中的具体实现 | 效果 |
|----------|---------------------|------|
| **Role Setting** | "You are an expert interview analysis assistant" | 建立专业 persona，设定输出风格 |
| **Task Decomposition** | 1) Question Extraction 2) Reflection Generation | 分解复杂任务，提高输出质量 |
| **Anti-Hallucination** | "based on context clues" / "specific examples" | 强制基于证据评估，拒绝臆断 |
| **Tone Control** | "Be constructive and growth-oriented, never harsh" | 确保输出可直接展示给用户 |
| **Bilingual Support** | "mixed Chinese/English" | 原生支持中英混合 transcript |
| **Strict Schema** | 完整 JSON structure 嵌入 prompt | 100% 格式可控，便于前端解析 |
| **Low Temperature** | `temperature: 0.3` | 降低随机性，提高结构化输出稳定性 |

---

### Layer 2: Role Debrief Agent — Complete System Prompt

```typescript
const SYSTEM_PROMPT = `You are a Career Coach AI that aggregates multiple interview round analyses into a comprehensive Role Debrief.

Given the multi-round interview data, generate a structured JSON analysis with:

1. **interviewerMapping**: For each round, identify:
   - Background of interviewer (infer from questions: HR, Hiring Manager, Tech Lead, etc.)
   - Focus dimensions (top 2 areas tested)
   - Key highlight (what went well)
   - Key risk (main weakness shown)

2. **competencyHeatmap**: Score these competencies (1-5) based on evidence:
   - product_sense: Product thinking and user focus
   - execution: Getting things done, practical solutions
   - analytics_metrics: Data-driven thinking
   - communication: Clear articulation of ideas
   - technical_depth: Technical knowledge depth
   - AI_skills: AI/ML understanding and application
   - system_design: System thinking and architecture
   - business_strategy: Strategic thinking
   - leadership: Leadership and ownership
   - stress_resilience: Handling pressure

3. **keyInsights**:
   - careMost: What the company prioritizes (2-3 items)
   - strengths: Your consistent strong points (2-3 items)
   - risks: Repeated weaknesses to fix (2-3 items)

4. **hiringLikelihood**:
   - level: "Low" | "Medium" | "High"
   - confidence: 0-1 score
   - reasons: 3 bullet points explaining the assessment

5. **nextBestActions**: 3-5 specific actionable preparation items

Return ONLY valid JSON matching this structure:
{
  "interviewerMapping": [
    {
      "roundId": "string",
      "roundName": "string",
      "interviewerBackground": "string",
      "focusDimensions": ["string", "string"],
      "highlight": "string",
      "risk": "string"
    }
  ],
  "competencyHeatmap": {
    "product_sense": { "score": 1-5, "evidence": "string" },
    "execution": { "score": 1-5, "evidence": "string" },
    ...
  },
  "keyInsights": {
    "careMost": ["string"],
    "strengths": ["string"],
    "risks": ["string"]
  },
  "hiringLikelihood": {
    "level": "Low|Medium|High",
    "confidence": 0.0-1.0,
    "reasons": ["string"]
  },
  "nextBestActions": [
    { "action": "string", "priority": "high|medium|low", "targetGap": "string" }
  ],
  "roleSummary": "2-3 sentence overall summary"
}`;

// API Configuration
const apiConfig = {
  model: "google/gemini-3-flash-preview",
  temperature: 0.7,  // 稍高温度允许更丰富的推理
  max_tokens: 4000
};
```

#### Layer 2 Prompt Design Analysis

| 技术策略 | Prompt 中的具体实现 | 效果 |
|----------|---------------------|------|
| **Evidence-Based Scoring** | `{ "score": 1-5, "evidence": "string" }` | 每个评分必须提供依据，杜绝 hallucination |
| **Competency Framework** | 10 维度标准化评估体系 | 可跨面试对比，构建长期能力档案 |
| **Confidence Calibration** | `confidence: 0-1 score` | 量化不确定性，避免过度自信的预测 |
| **Explainability** | `reasons: 3 bullet points` | 提高可解释性，用户可验证推理逻辑 |
| **Actionable Output** | `nextBestActions` with `priority` & `targetGap` | 行动导向，直接指导下一步准备 |
| **Higher Temperature** | `temperature: 0.7` | 允许更丰富的推理和洞察生成 |

---

### Prompt Engineering Best Practices Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prompt Design Principles                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ROLE SETTING                                               │
│     └─ "You are an expert..." → 设定专业人格                    │
│                                                                 │
│  2. TASK DECOMPOSITION                                         │
│     └─ 复杂任务拆解为独立子任务                                  │
│                                                                 │
│  3. ANTI-HALLUCINATION                                         │
│     ├─ "based on context clues" → 强制基于证据                  │
│     ├─ evidence 字段必填 → 杜绝无依据评分                       │
│     └─ 结构化输出 → 降低自由发挥空间                            │
│                                                                 │
│  4. STRUCTURED OUTPUT                                          │
│     ├─ JSON schema 嵌入 prompt → 100% 格式可控                  │
│     └─ 使用 enum 约束字段值 → 前端可直接渲染                    │
│                                                                 │
│  5. TEMPERATURE TUNING                                         │
│     ├─ 0.3 for extraction tasks → 稳定一致                      │
│     └─ 0.7 for reasoning tasks → 丰富洞察                       │
│                                                                 │
│  6. TONE CONTROL                                               │
│     └─ "Be constructive, never harsh" → 用户友好输出            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

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
