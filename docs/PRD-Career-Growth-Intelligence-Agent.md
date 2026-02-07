# 🚀 Career Growth Intelligence Agent — PRD

> **Document Version**: 1.0  
> **Last Updated**: 2026-02-07  
> **Author**: Product & AI Architecture Team  
> **Parent System**: CareerPilot AI Interview Intelligence System

---

## 1️⃣ Product Overview

### 产品名称
**Career Growth Intelligence Agent (Layer 3)**

### 产品定位
Career Growth Intelligence Agent 是 CareerPilot AI 系统的第三层智能代理，负责**跨职位、跨时间维度**的长期能力演化分析。

```
┌─────────────────────────────────────────────────────────────────┐
│                 CareerPilot AI Three-Layer Architecture          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Transcript Analyzer                                   │
│  └─ 单轮面试分析 (问题提取 + 反思生成)                             │
│                                                                 │
│  Layer 2: Role Debrief Agent                                    │
│  └─ 单岗位多轮汇总 (能力热力图 + 录用可能性)                        │
│                                                                 │
│  Layer 3: Career Growth Intelligence Agent ← THIS DOCUMENT      │
│  └─ 跨岗位长期追踪 (能力演化 + 成长趋势 + 教练建议)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 目标用户
| 用户类型 | 使用场景 | 核心需求 |
|----------|----------|----------|
| **持续求职者** | 经历多次面试后想了解整体成长轨迹 | 看到自己的进步，识别持续短板 |
| **职业转型者** | 跨行业面试，需要评估新领域适应度 | 跨领域能力迁移分析 |
| **长期用户** | 使用 CareerPilot 超过 3 个月 | 回顾职业成长历程，规划发展方向 |

### 核心价值主张

| 痛点 | 现状 | Career Growth Agent 解决方案 |
|------|------|------------------------------|
| 🔴 **看不到成长** | 一次次面试后不知道自己是否在进步 | 时序对比分析，量化能力 delta |
| 🔴 **短板反复出现** | 同样的弱点在多个面试中暴露 | 识别 "persistent gaps"，重点提醒 |
| 🔴 **优势不自知** | 不清楚自己的核心竞争力 | "stable advantages" 提炼，建立信心 |
| 🔴 **下一步迷茫** | 不知道应该优先提升什么能力 | AI 教练建议 + 优先级排序 |

---

## 2️⃣ System Architecture

### Agent Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                LAYER 3: Career Growth Intelligence Agent         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Data Sources (from Layer 1 & Layer 2)                          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Job 1: Stage 1, Stage 2, Stage 3...                  │      │
│  │ Job 2: Stage 1, Stage 2...                           │      │
│  │ Job 3: Stage 1...                                    │      │
│  │ ...                                                  │      │
│  │ Each stage contains:                                 │      │
│  │ ├─ questions[] with responseQuality                  │      │
│  │ ├─ reflection{} with whatWentWell/whatCouldImprove   │      │
│  │ └─ competencyScores{} (from Role Debrief if exists)  │      │
│  └──────────────────────────────────────────────────────┘      │
│       │                                                         │
│       │ Chronological Sorting                                   │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Career Growth Intelligence Agent                    │      │
│  │  ├─ Time-Based Comparison (earliest → latest)        │      │
│  │  ├─ Competency Evolution Analysis (10 dimensions)    │      │
│  │  ├─ Strength vs Gap Classification                   │      │
│  │  ├─ Growth Narrative Generation                      │      │
│  │  └─ Coach Message Synthesis                          │      │
│  └──────────────────────────────────────────────────────┘      │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Career Growth Analysis Output                       │      │
│  │  ├─ timelineOverview{} (time range, roles covered)   │      │
│  │  ├─ competencyTrends[] (scores over time, deltas)    │      │
│  │  ├─ visualizationData{} (line/radar/bar chart data)  │      │
│  │  ├─ insightSummary{} (improvements, gaps, risks)     │      │
│  │  ├─ nextGrowthPriorities[] (focus areas)             │      │
│  │  └─ coachMessage (personalized encouragement)        │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Data Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Archive Page - Career Growth Tab)                    │
│       │                                                         │
│       │ 1. Collect all jobs with analyzed stages                │
│       │ 2. Filter stages with questions[] or reflection{}       │
│       │ 3. Build RoundData[] payload                            │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  POST /functions/v1/analyze-career-growth            │      │
│  │  Body: { rounds: RoundData[] }                       │      │
│  └──────────────────────────────────────────────────────┘      │
│       │                                                         │
│       ▼                                                         │
│  Edge Function: analyze-career-growth                           │
│       │                                                         │
│       │ 1. Sort rounds chronologically                          │
│       │ 2. Build user prompt with all historical data           │
│       │ 3. Call Lovable AI Gateway (Gemini 3 Flash)             │
│       │ 4. Parse JSON response                                  │
│       │ 5. Add metadata (generatedAt, sourceRoundCount)         │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Response: CareerGrowthAnalysis                      │      │
│  └──────────────────────────────────────────────────────┘      │
│       │                                                         │
│       ▼                                                         │
│  Frontend renders:                                              │
│  ├─ CompetencyLineChart (trends over time)                      │
│  ├─ CompetencyRadarChart (past vs current)                      │
│  ├─ StrengthsGapsChart (bar chart)                              │
│  ├─ Insight Cards                                               │
│  └─ Coach Message                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Unlock Logic

```typescript
// Career Growth analysis requires ≥2 analyzed interview rounds
const totalAnalyzedRounds = jobs.reduce((count, job) => {
  return count + job.stages.filter(
    stage => stage.status === 'completed' && 
             (stage.questions?.length > 0 || stage.reflection)
  ).length;
}, 0);

const isGrowthUnlocked = totalAnalyzedRounds >= 2;
```

**Rationale**: 
- 1 round = 无法计算趋势，只有单点数据
- ≥2 rounds = 可以计算 delta，生成有意义的趋势分析

---

## 3️⃣ Model Strategy

### Model Selection

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Model** | `google/gemini-3-flash-preview` | 最新 Gemini 3 系列，平衡速度与推理深度 |
| **Temperature** | `0.5` | 中等温度：结构化输出 + 允许洞察生成 |
| **Max Tokens** | `8000` | 支持 10+ 维度 × 多个时间点的详细分析 |
| **Context Window** | 需支持 10+ rounds × ~500 tokens/round | Gemini 3 Flash 1M tokens 足够 |

### Why Gemini 3 Flash for Career Growth?

| 需求 | Gemini 3 Flash | Gemini 2.5 Flash | GPT-4 |
|------|----------------|------------------|-------|
| **跨时间推理** | ✅ 优秀 | ✅ 良好 | ✅ 优秀 |
| **趋势识别** | ✅ 稳定 | ⚠️ 中等 | ✅ 稳定 |
| **结构化输出** | ✅ 高一致性 | ✅ 良好 | ✅ 高一致性 |
| **成本效率** | ✅ 最优 | ✅ 良好 | ❌ 昂贵 |
| **响应速度** | ✅ 快 (~3s) | ✅ 快 | ⚠️ 中等 |

---

## 4️⃣ Prompt Engineering — Complete Prompt Content

### System Prompt (完整内容)

```typescript
const SYSTEM_PROMPT = `You are a Career Growth Intelligence Agent.

Your task is to analyze a user's historical interview analytics data (across multiple interview rounds, roles, and time periods) and generate a time-ordered career growth analysis.

=== CORE ANALYSIS REQUIREMENTS ===

A. Time-Based Comparison (CRITICAL)
- Always analyze performance changes from earliest → latest
- Identify trends, not single-point observations
- Explicitly calculate deltas (increase / decrease / flat)

B. Competency Evolution Analysis
For each competency:
- Determine trend: improving / stable / declining
- Identify when the change started
- Explain likely reasons using evidence from interview data

C. Strength vs Gap Classification
- Strengths = consistently high or clearly improving competencies
- Gaps = consistently low or non-improving competencies
- Call out "false strengths" (high variance but unstable)

D. Growth Narrative
Generate a concise but clear narrative:
- "Where you started"
- "How you changed"
- "Where you are now"
- "What matters most next"

=== COMPETENCIES TO TRACK ===
Infer scores (1-5) for these 10 competencies based on response quality, question categories, and reflection content:
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

=== OUTPUT FORMAT ===
Return ONLY valid JSON with this structure:

{
  "timelineOverview": {
    "timeRange": "string (e.g. 2024 Q1 – 2025 Q1)",
    "totalInterviews": number,
    "rolesCovered": ["string"]
  },
  "competencyTrends": [
    {
      "competency": "string",
      "scoresOverTime": [
        { "date": "YYYY-MM", "score": number }
      ],
      "trend": "improving" | "stable" | "declining",
      "delta": number,
      "interpretation": "string"
    }
  ],
  "visualizationData": {
    "lineChart": [
      {
        "competency": "string",
        "data": [
          { "x": "YYYY-MM", "y": number }
        ]
      }
    ],
    "radarChart": {
      "pastAverage": { "competency_name": number },
      "currentAverage": { "competency_name": number }
    },
    "barChart": {
      "strengths": [
        { "competency": "string", "score": number }
      ],
      "gaps": [
        { "competency": "string", "score": number }
      ]
    }
  },
  "insightSummary": {
    "keyImprovements": ["string"],
    "stableAdvantages": ["string"],
    "persistentGaps": ["string"],
    "biggestPositiveChange": "string",
    "biggestUnresolvedRisk": "string"
  },
  "nextGrowthPriorities": [
    {
      "focusArea": "string",
      "reason": "string",
      "expectedImpact": "high" | "medium" | "low"
    }
  ],
  "coachMessage": "A short, encouraging but honest message helping the user understand their growth journey"
}

Be objective, evidence-based, and encouraging. Avoid vague praise or harsh judgment.
Think like a career coach + data analyst.`;
```

### User Prompt (动态生成逻辑)

```typescript
// Build user prompt with all historical data
let userPrompt = `Analyze this historical interview data and generate a career growth analysis:\\n\\n`;
userPrompt += `**Total Interview Rounds:** ${sortedRounds.length}\\n\\n`;

sortedRounds.forEach((round, index) => {
  userPrompt += `--- Round ${index + 1}: ${round.companyName} - ${round.roleTitle} (${round.stageName}) ---\\n`;
  userPrompt += `Date: ${round.roundDate}\\n`;
  
  if (round.questions && round.questions.length > 0) {
    const qualityDist = {
      high: round.questions.filter(q => q.responseQuality === 'high').length,
      medium: round.questions.filter(q => q.responseQuality === 'medium').length,
      low: round.questions.filter(q => q.responseQuality === 'low').length,
    };
    const avgDifficulty = round.questions.reduce((sum, q) => sum + q.difficulty, 0) / round.questions.length;
    
    userPrompt += `Questions: ${round.questions.length} total\\n`;
    userPrompt += `Response Quality Distribution: High=${qualityDist.high}, Medium=${qualityDist.medium}, Low=${qualityDist.low}\\n`;
    userPrompt += `Average Difficulty: ${avgDifficulty.toFixed(1)}/5\\n`;
    
    const categories = [...new Set(round.questions.map(q => q.category))];
    userPrompt += `Categories: ${categories.join(', ')}\\n`;
    
    const allTags = round.questions.flatMap(q => q.tags || []);
    if (allTags.length > 0) {
      userPrompt += `Skills Tested: ${[...new Set(allTags)].join(', ')}\\n`;
    }
  }

  if (round.reflection) {
    userPrompt += `Overall Feeling: ${round.reflection.overallFeeling}\\n`;
    if (round.reflection.whatWentWell?.length) {
      userPrompt += `Went Well: ${round.reflection.whatWentWell.join('; ')}\\n`;
    }
    if (round.reflection.whatCouldImprove?.length) {
      userPrompt += `Could Improve: ${round.reflection.whatCouldImprove.join('; ')}\\n`;
    }
    if (round.reflection.keyTakeaways?.length) {
      userPrompt += `Key Takeaways: ${round.reflection.keyTakeaways.join('; ')}\\n`;
    }
  }

  if (round.competencyScores) {
    userPrompt += `Competency Scores: ${JSON.stringify(round.competencyScores)}\\n`;
  }

  userPrompt += `\\n`;
});

userPrompt += `\\nAnalyze the evolution of this candidate's interview performance over time. Identify trends, improvements, and persistent gaps. Return ONLY valid JSON.`;
```

### User Prompt 生成示例

```
Analyze this historical interview data and generate a career growth analysis:

**Total Interview Rounds:** 4

--- Round 1: Google - Product Manager (Phone Screen) ---
Date: 2024-06-15
Questions: 5 total
Response Quality Distribution: High=1, Medium=3, Low=1
Average Difficulty: 3.2/5
Categories: Behavioral, Product Case
Skills Tested: Product Sense, Communication
Overall Feeling: neutral
Went Well: Explained product intuition clearly
Could Improve: Struggled with metrics definition
Key Takeaways: Need to practice data-driven frameworks

--- Round 2: Meta - Senior PM (Onsite Round 1) ---
Date: 2024-08-20
Questions: 6 total
Response Quality Distribution: High=2, Medium=3, Low=1
Average Difficulty: 4.0/5
Categories: Technical, System Design
Skills Tested: System Design, Technical Depth, Analytics
Overall Feeling: good
Went Well: System design structure was praised
Could Improve: Should quantify impact more
Key Takeaways: Meta values execution speed

--- Round 3: OpenAI - PM (Technical Interview) ---
Date: 2024-11-10
Questions: 4 total
Response Quality Distribution: High=3, Medium=1, Low=0
Average Difficulty: 4.5/5
Categories: Technical, AI/ML
Skills Tested: AI Skills, Product Sense, Technical Depth
Overall Feeling: great
Went Well: AI product design impressed interviewer; Showed strong ML intuition
Could Improve: Could go deeper on implementation details
Key Takeaways: AI-first thinking is my differentiator

--- Round 4: Anthropic - Product Lead (Final Round) ---
Date: 2025-01-22
Questions: 5 total
Response Quality Distribution: High=4, Medium=1, Low=0
Average Difficulty: 4.8/5
Categories: Leadership, Strategy, AI/ML
Skills Tested: Leadership, AI Skills, Business Strategy
Overall Feeling: great
Went Well: Leadership stories resonated; Strategic thinking was highlighted
Could Improve: Minor - could be more concise
Key Takeaways: My AI-native PM profile is now well-defined

Analyze the evolution of this candidate's interview performance over time. Identify trends, improvements, and persistent gaps. Return ONLY valid JSON.
```

---

## 5️⃣ Prompt Design Analysis

### Prompt Engineering Techniques Applied

| 技术策略 | Prompt 中的具体实现 | 效果 |
|----------|---------------------|------|
| **Role Setting** | "You are a Career Growth Intelligence Agent" | 建立专业 persona：职业教练 + 数据分析师 |
| **Task Decomposition** | A/B/C/D 四个核心分析模块 | 结构化推理，确保全面覆盖 |
| **Anti-Hallucination** | "using evidence from interview data" | 强制基于证据推理，拒绝臆断 |
| **Trend Focus** | "earliest → latest", "calculate deltas" | 确保时序分析，不只是静态评估 |
| **Competency Framework** | 10 维度标准化评估体系 | 可跨时间对比，构建长期能力档案 |
| **Strict Schema** | 完整 JSON structure 嵌入 prompt | 100% 格式可控，便于前端解析 |
| **Tone Control** | "objective, evidence-based, and encouraging" | 确保输出可直接展示给用户 |
| **Medium Temperature** | `temperature: 0.5` | 平衡结构化输出与洞察生成 |

### 与 Layer 1/2 的 Prompt 设计对比

| 维度 | Layer 1 (Transcript) | Layer 2 (Role Debrief) | Layer 3 (Career Growth) |
|------|---------------------|------------------------|-------------------------|
| **输入范围** | 单轮 transcript | 单岗位多轮 | 跨岗位多轮 |
| **时间维度** | 无 (单点) | 弱 (轮次顺序) | 强 (时序演化) |
| **核心任务** | 提取 + 分类 | 汇总 + 预测 | 趋势 + 教练 |
| **Temperature** | 0.3 (高一致性) | 0.7 (丰富推理) | 0.5 (平衡) |
| **特有输出** | questions[], reflection | competencyHeatmap, hiringLikelihood | competencyTrends[], coachMessage |

---

## 6️⃣ Output Schema — Complete TypeScript Types

```typescript
// src/types/career-growth.ts

export interface CompetencyTrendPoint {
  date: string; // YYYY-MM format
  score: number; // 1-5
}

export interface CompetencyTrend {
  competency: string;
  scoresOverTime: CompetencyTrendPoint[];
  trend: 'improving' | 'stable' | 'declining';
  delta: number; // Change from first to last score (can be negative)
  interpretation: string; // AI explanation of the trend
}

export interface LineChartData {
  competency: string;
  data: Array<{ x: string; y: number }>; // x = YYYY-MM, y = score
}

export interface RadarChartData {
  pastAverage: Record<string, number>;    // First half of data points
  currentAverage: Record<string, number>; // Second half of data points
}

export interface BarChartData {
  strengths: Array<{ competency: string; score: number }>;
  gaps: Array<{ competency: string; score: number }>;
}

export interface VisualizationData {
  lineChart: LineChartData[];
  radarChart: RadarChartData;
  barChart: BarChartData;
}

export interface GrowthPriority {
  focusArea: string;
  reason: string;
  expectedImpact: 'high' | 'medium' | 'low';
}

export interface InsightSummary {
  keyImprovements: string[];      // Competencies that got better
  stableAdvantages: string[];     // Consistently strong areas
  persistentGaps: string[];       // Weak areas that haven't improved
  biggestPositiveChange: string;  // Most notable improvement
  biggestUnresolvedRisk: string;  // Most critical gap to address
}

export interface TimelineOverview {
  timeRange: string;        // e.g., "2024 Q2 – 2025 Q1"
  totalInterviews: number;
  rolesCovered: string[];   // Unique role titles
}

export interface CareerGrowthAnalysis {
  timelineOverview: TimelineOverview;
  competencyTrends: CompetencyTrend[];
  visualizationData: VisualizationData;
  insightSummary: InsightSummary;
  nextGrowthPriorities: GrowthPriority[];
  coachMessage: string;
  generatedAt: string;      // ISO timestamp
  sourceRoundCount: number; // Number of rounds analyzed
}
```

---

## 7️⃣ Input Schema — RoundData Structure

```typescript
// Input to the Edge Function
export interface RoundDataForGrowthAnalysis {
  roundDate: string;        // ISO date string
  jobId: string;
  companyName: string;
  roleTitle: string;
  stageName: string;        // e.g., "Phone Screen", "Onsite Round 1"
  
  questions: Array<{
    category: string;       // From Layer 1: behavioral, technical, etc.
    responseQuality: 'high' | 'medium' | 'low';
    difficulty: number;     // 1-5
    tags?: string[];        // Skills/topics tested
  }>;
  
  reflection?: {
    overallFeeling: string;
    whatWentWell: string[];
    whatCouldImprove: string[];
    keyTakeaways: string[];
  };
  
  competencyScores?: Record<string, number>; // From Layer 2 if available
}

export interface CareerGrowthRequest {
  rounds: RoundDataForGrowthAnalysis[];
}
```

---

## 8️⃣ Edge Function Implementation

### File Location
`supabase/functions/analyze-career-growth/index.ts`

### Core Logic Flow

```typescript
Deno.serve(async (req) => {
  // 1. CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Parse input
    const { rounds }: { rounds: RoundData[] } = await req.json();
    
    // 3. Validate minimum rounds
    if (!rounds || rounds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No interview rounds provided" }),
        { status: 400 }
      );
    }

    // 4. Sort chronologically (CRITICAL for trend analysis)
    const sortedRounds = [...rounds].sort(
      (a, b) => new Date(a.roundDate).getTime() - new Date(b.roundDate).getTime()
    );

    // 5. Build user prompt (see Section 4)
    const userPrompt = buildUserPrompt(sortedRounds);

    // 6. Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      }),
    });

    // 7. Handle errors
    if (!response.ok) {
      if (response.status === 429) return rateLimit();
      if (response.status === 402) return creditsExhausted();
      throw new Error(`AI API error: ${response.status}`);
    }

    // 8. Parse and clean JSON response
    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    const analysis = parseJsonResponse(content);

    // 9. Add metadata and return
    return new Response(JSON.stringify({
      ...analysis,
      generatedAt: new Date().toISOString(),
      sourceRoundCount: rounds.length,
    }));

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

---

## 9️⃣ Visualization Strategy

### Chart Components

| 图表类型 | 组件 | 数据来源 | 展示目的 |
|----------|------|----------|----------|
| **趋势折线图** | `CompetencyLineChart` | `visualizationData.lineChart` | 展示各能力随时间的演化 |
| **对比雷达图** | `CompetencyRadarChart` | `visualizationData.radarChart` | Past vs Current 能力对比 |
| **强弱柱状图** | `StrengthsGapsChart` | `visualizationData.barChart` | 一目了然的优势/短板 |

### Visualization Data Structure

```typescript
// Line Chart: Each competency has a time series
lineChart: [
  {
    competency: "product_sense",
    data: [
      { x: "2024-06", y: 3.2 },
      { x: "2024-08", y: 3.5 },
      { x: "2024-11", y: 4.0 },
      { x: "2025-01", y: 4.2 }
    ]
  },
  // ... other competencies
]

// Radar Chart: Past vs Current comparison
radarChart: {
  pastAverage: {
    "product_sense": 3.0,
    "execution": 3.2,
    "AI_skills": 2.5,
    // ...
  },
  currentAverage: {
    "product_sense": 4.2,
    "execution": 4.0,
    "AI_skills": 4.5,
    // ...
  }
}

// Bar Chart: Top strengths and gaps
barChart: {
  strengths: [
    { competency: "AI_skills", score: 4.5 },
    { competency: "product_sense", score: 4.2 }
  ],
  gaps: [
    { competency: "analytics_metrics", score: 2.8 },
    { competency: "stress_resilience", score: 3.0 }
  ]
}
```

---

## 🔟 Evaluation Framework

### Quality Metrics

| 指标 | 目标 | 测量方法 |
|------|------|----------|
| **趋势准确性** | >85% 用户认同趋势方向 | 用户反馈 survey |
| **可操作性** | >80% 用户认为建议有帮助 | nextGrowthPriorities 点击率 |
| **情感共鸣** | >4.0/5 coachMessage 满意度 | 用户评分 |
| **JSON 解析成功率** | >99% | 自动化监控 |
| **响应时间** | <5s (P95) | APM 监控 |

### Anti-Hallucination Safeguards

| 策略 | 实现方式 |
|------|----------|
| **Evidence Requirement** | Prompt 强制要求 "using evidence from interview data" |
| **Structured Output** | JSON schema 限制自由发挥空间 |
| **Delta Calculation** | 强制计算具体数值变化，而非主观描述 |
| **Interpretation Field** | 每个趋势必须附带解释，便于验证 |
| **Low-Medium Temperature** | `0.5` 降低随机性 |

---

## 1️⃣1️⃣ Error Handling

### Error Response Matrix

| HTTP Status | Error Type | User Message |
|-------------|------------|--------------|
| 400 | No rounds provided | "请至少分析 2 个面试轮次才能生成成长报告" |
| 402 | Credits exhausted | "AI 积分已用完，请充值后继续" |
| 429 | Rate limit | "请求过于频繁，请稍后重试" |
| 500 | Internal error | "分析失败，请重试" |

### JSON Parsing Resilience

```typescript
// Handle markdown code blocks in AI response
let jsonContent = content.trim();
if (jsonContent.startsWith("```json")) {
  jsonContent = jsonContent.slice(7);
} else if (jsonContent.startsWith("```")) {
  jsonContent = jsonContent.slice(3);
}
if (jsonContent.endsWith("```")) {
  jsonContent = jsonContent.slice(0, -3);
}
jsonContent = jsonContent.trim();

const analysis = JSON.parse(jsonContent);
```

---

## 1️⃣2️⃣ Future Enhancements

### Roadmap

| Phase | Feature | Description |
|-------|---------|-------------|
| **v1.1** | 行业对标 | 与同行业候选人的匿名对比 |
| **v1.2** | 预测模型 | 基于趋势预测未来 6 个月能力水平 |
| **v1.3** | 个性化学习路径 | 根据 gaps 推荐课程/练习 |
| **v2.0** | 多语言 Coach | 支持英/中双语 coachMessage |

### Potential Competency Additions

- `design_thinking`: 设计思维
- `cross_functional_collaboration`: 跨职能协作
- `customer_empathy`: 客户同理心
- `innovation`: 创新能力

---

## 1️⃣3️⃣ Appendix

### 10 Core Competencies Definition

| Competency | Key | Description | Evidence Sources |
|------------|-----|-------------|------------------|
| 产品感 | `product_sense` | 产品思维与用户导向 | Product case 问题表现 |
| 执行力 | `execution` | 落地能力与实际解决方案 | Situational 问题表现 |
| 数据分析 | `analytics_metrics` | 数据驱动思维 | Metrics 相关问题 |
| 沟通能力 | `communication` | 清晰表达想法 | 整体 response quality |
| 技术深度 | `technical_depth` | 技术知识深度 | Technical 问题表现 |
| AI 能力 | `AI_skills` | AI/ML 理解与应用 | AI 相关问题表现 |
| 系统设计 | `system_design` | 系统思维与架构 | System design 问题 |
| 商业战略 | `business_strategy` | 战略思考能力 | Strategy/Case 问题 |
| 领导力 | `leadership` | 领导力与担当 | Behavioral 问题中的领导案例 |
| 抗压能力 | `stress_resilience` | 压力下的表现 | 高难度问题的 response quality |

---

**Document End**

> *"Growth is not a destination, it's a direction."*  
> — Career Growth Intelligence Agent
