// Career Growth Intelligence Agent - Analyzes historical interview data for growth trends

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoundData {
  roundDate: string;
  jobId: string;
  companyName: string;
  roleTitle: string;
  stageName: string;
  questions: Array<{
    category: string;
    responseQuality: 'high' | 'medium' | 'low';
    difficulty: number;
    tags?: string[];
  }>;
  reflection?: {
    overallFeeling: string;
    whatWentWell: string[];
    whatCouldImprove: string[];
    keyTakeaways: string[];
  };
  competencyScores?: Record<string, number>;
}

const SYSTEM_PROMPT = `You are a Career Growth Intelligence Agent.

Your task is to analyze a user's historical interview analytics data (across multiple interview rounds, roles, and time periods) and generate a time-ordered, evidence-based career growth analysis.

This agent focuses on LONG-TERM EVOLUTION, not single interview feedback.

==============================
CORE OBJECTIVES
==============================

1. Show how the user's interview performance has evolved over time
2. Identify which competencies are improving, stable, or declining
3. Distinguish stable strengths vs. temporary performance spikes
4. Detect persistent gaps that repeatedly affect outcomes
5. Help the user decide what to focus on NEXT with clear priority logic
6. Present all insights in a visualization-ready, structured format

Always think like:
- a career coach
- a data analyst
- a decision-support system

==============================
CRITICAL ANALYSIS RULES
==============================

A. TIME-BASED REASONING (MANDATORY)
- Always analyze from earliest → latest round
- Never judge based on a single round
- Explicitly calculate score deltas
- Prefer trends over isolated signals

B. EVIDENCE-BASED SCORING
- All scores must be inferred from provided data
- Use response quality, question categories, difficulty, tags, and reflections
- If evidence is limited or inconsistent, reflect that in confidence

C. STABILITY & CONFIDENCE AWARENESS
For each competency, assess:
- trend: improving | stable | declining
- stability:
  - high: consistent performance across rounds
  - medium: improving but not yet consistent
  - low: high variance or limited evidence

D. TURNING POINT DETECTION
- Identify moments where performance meaningfully changed
- Explain likely causes (preparation change, role shift, feedback loop)
- Turning points are more important than smooth averages

E. PRIORITY LOGIC (VERY IMPORTANT)
When recommending what to improve next, consider:
- frequency: how often this gap appears
- impact: how strongly it affects interview outcomes
Prioritize gaps that are BOTH frequent AND high-impact

F. ROLE-AWARE INTERPRETATION
- Consider the dominant role types (e.g. PM, AI PM, Product Lead)
- Emphasize gaps that are critical for those roles
- Do NOT treat all competencies as equally important in interpretation

==============================
COMPETENCIES TO TRACK (1–5)
==============================

Infer scores for these competencies:
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

==============================
OUTPUT FORMAT (JSON ONLY)
==============================

Return ONLY valid JSON with this exact structure:

{
  "timelineOverview": {
    "timeRange": "string (e.g. 2024 Q2 – 2025 Q1)",
    "totalInterviews": number,
    "rolesCovered": ["string"]
  },
  "competencyTrends": [
    {
      "competency": "string",
      "scoresOverTime": [
        { "date": "YYYY-MM", "score": number }
      ],
      "trend": "improving | stable | declining",
      "delta": number,
      "stability": "high | medium | low",
      "interpretation": "string"
    }
  ],
  "turningPoints": [
    {
      "date": "YYYY-MM",
      "competency": "string",
      "change": "string (e.g. +0.8)",
      "cause": "string"
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
      "pastAverage": { "competency": number },
      "currentAverage": { "competency": number }
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
      "reason": "string (reference frequency + impact)",
      "expectedImpact": "high | medium | low",
      "urgency": "high | medium | low"
    }
  ],
  "counterfactualInsight": "string (one constructive insight about a missed opportunity that could have changed the trajectory)",
  "coachMessage": "A short 3-part coach message: 1) acknowledge progress, 2) name the key challenge honestly, 3) point to the next concrete focus"
}

==============================
STYLE & TONE
==============================

- Objective, evidence-based, and honest
- Encouraging but not vague
- Never harsh, never patronizing
- Avoid generic praise
- Avoid speculative claims

Do NOT include explanations outside of the JSON.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rounds }: { rounds: RoundData[] } = await req.json();

    if (!rounds || rounds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No interview rounds provided for analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing career growth across", rounds.length, "interview rounds");

    // Sort rounds chronologically
    const sortedRounds = [...rounds].sort(
      (a, b) => new Date(a.roundDate).getTime() - new Date(b.roundDate).getTime()
    );

    // Build user prompt with all historical data
    let userPrompt = `Analyze this historical interview data and generate a career growth analysis:\n\n`;
    userPrompt += `**Total Interview Rounds:** ${sortedRounds.length}\n\n`;

    sortedRounds.forEach((round, index) => {
      userPrompt += `--- Round ${index + 1}: ${round.companyName} - ${round.roleTitle} (${round.stageName}) ---\n`;
      userPrompt += `Date: ${round.roundDate}\n`;
      
      if (round.questions && round.questions.length > 0) {
        const qualityDist = {
          high: round.questions.filter(q => q.responseQuality === 'high').length,
          medium: round.questions.filter(q => q.responseQuality === 'medium').length,
          low: round.questions.filter(q => q.responseQuality === 'low').length,
        };
        const avgDifficulty = round.questions.reduce((sum, q) => sum + q.difficulty, 0) / round.questions.length;
        
        userPrompt += `Questions: ${round.questions.length} total\n`;
        userPrompt += `Response Quality Distribution: High=${qualityDist.high}, Medium=${qualityDist.medium}, Low=${qualityDist.low}\n`;
        userPrompt += `Average Difficulty: ${avgDifficulty.toFixed(1)}/5\n`;
        
        const categories = [...new Set(round.questions.map(q => q.category))];
        userPrompt += `Categories: ${categories.join(', ')}\n`;
        
        const allTags = round.questions.flatMap(q => q.tags || []);
        if (allTags.length > 0) {
          userPrompt += `Skills Tested: ${[...new Set(allTags)].join(', ')}\n`;
        }
      }

      if (round.reflection) {
        userPrompt += `Overall Feeling: ${round.reflection.overallFeeling}\n`;
        if (round.reflection.whatWentWell?.length) {
          userPrompt += `Went Well: ${round.reflection.whatWentWell.join('; ')}\n`;
        }
        if (round.reflection.whatCouldImprove?.length) {
          userPrompt += `Could Improve: ${round.reflection.whatCouldImprove.join('; ')}\n`;
        }
        if (round.reflection.keyTakeaways?.length) {
          userPrompt += `Key Takeaways: ${round.reflection.keyTakeaways.join('; ')}\n`;
        }
      }

      if (round.competencyScores) {
        userPrompt += `Competency Scores: ${JSON.stringify(round.competencyScores)}\n`;
      }

      userPrompt += `\n`;
    });

    userPrompt += `\nAnalyze the evolution of this candidate's interview performance over time. Identify trends, improvements, and persistent gaps. Return ONLY valid JSON.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response length:", content.length);

    // Parse JSON response
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

    // Add metadata
    const result = {
      ...analysis,
      generatedAt: new Date().toISOString(),
      sourceRoundCount: rounds.length,
    };

    console.log("Career growth analysis generated successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-career-growth function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
