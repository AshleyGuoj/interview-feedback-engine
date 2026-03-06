// Career Growth Intelligence Agent
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function authenticateRequest(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) throw new Error("UNAUTHORIZED");
  return data.claims.sub as string;
}

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

const getSystemPrompt = (language: string) => {
  const isEnglish = language === 'en';
  
  return `You are a Career Growth Intelligence Agent.

Your task is to analyze a user's historical interview analytics data (across multiple interview rounds, roles, and time periods) and generate a time-ordered, evidence-based career growth analysis.

This agent focuses on LONG-TERM EVOLUTION, not single interview feedback.

IMPORTANT: All text content in your response MUST be in ${isEnglish ? 'English' : 'Chinese (中文)'}.

==============================
CORE OBJECTIVES
==============================

1. Show how the user's interview performance has evolved over time
2. Identify which competencies are improving, stable, or declining
3. Distinguish stable strengths vs. temporary performance spikes
4. Detect persistent gaps that repeatedly affect outcomes
5. Help the user decide what to focus on NEXT with clear priority logic
6. Present all insights in a visualization-ready, structured format

==============================
COMPETENCIES TO TRACK (1–5)
==============================

product_sense, execution, analytics_metrics, communication, technical_depth,
AI_skills, system_design, business_strategy, leadership, stress_resilience

==============================
OUTPUT FORMAT (JSON ONLY)
==============================

Return ONLY valid JSON with this structure:

{
  "timelineOverview": { "timeRange": "string", "totalInterviews": number, "rolesCovered": ["string"] },
  "competencyTrends": [
    { "competency": "string", "scoresOverTime": [{ "date": "YYYY-MM", "score": number }], "trend": "improving | stable | declining", "delta": number, "stability": "high | medium | low", "interpretation": "string" }
  ],
  "turningPoints": [{ "date": "YYYY-MM", "competency": "string", "change": "string", "cause": "string" }],
  "visualizationData": {
    "lineChart": [{ "competency": "string", "data": [{ "x": "YYYY-MM", "y": number }] }],
    "radarChart": { "pastAverage": {}, "currentAverage": {} },
    "barChart": { "strengths": [{ "competency": "string", "score": number }], "gaps": [{ "competency": "string", "score": number }] }
  },
  "insightSummary": { "keyImprovements": ["string"], "stableAdvantages": ["string"], "persistentGaps": ["string"], "biggestPositiveChange": "string", "biggestUnresolvedRisk": "string" },
  "nextGrowthPriorities": [{ "focusArea": "string", "reason": "string", "expectedImpact": "high | medium | low", "urgency": "high | medium | low" }],
  "counterfactualInsight": "string",
  "coachMessage": "string"
}

ALL TEXT CONTENT MUST BE IN ${isEnglish ? 'ENGLISH' : 'CHINESE (中文)'}
Do NOT include explanations outside of the JSON.`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    let userId: string;
    try {
      userId = await authenticateRequest(req);
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { rounds, language = 'en' }: { rounds: RoundData[]; language?: string } = await req.json();

    if (!rounds || rounds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No interview rounds provided for analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (rounds.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many rounds (max 50)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing career growth across", rounds.length, "rounds", "user:", userId);

    const sortedRounds = [...rounds].sort(
      (a, b) => new Date(a.roundDate).getTime() - new Date(b.roundDate).getTime()
    );

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
        userPrompt += `Response Quality: High=${qualityDist.high}, Medium=${qualityDist.medium}, Low=${qualityDist.low}\n`;
        userPrompt += `Average Difficulty: ${avgDifficulty.toFixed(1)}/5\n`;
        const categories = [...new Set(round.questions.map(q => q.category))];
        userPrompt += `Categories: ${categories.join(', ')}\n`;
        const allTags = round.questions.flatMap(q => q.tags || []);
        if (allTags.length > 0) userPrompt += `Skills Tested: ${[...new Set(allTags)].join(', ')}\n`;
      }
      if (round.reflection) {
        userPrompt += `Overall Feeling: ${round.reflection.overallFeeling}\n`;
        if (round.reflection.whatWentWell?.length) userPrompt += `Went Well: ${round.reflection.whatWentWell.join('; ')}\n`;
        if (round.reflection.whatCouldImprove?.length) userPrompt += `Could Improve: ${round.reflection.whatCouldImprove.join('; ')}\n`;
        if (round.reflection.keyTakeaways?.length) userPrompt += `Key Takeaways: ${round.reflection.keyTakeaways.join('; ')}\n`;
      }
      if (round.competencyScores) userPrompt += `Competency Scores: ${JSON.stringify(round.competencyScores)}\n`;
      userPrompt += `\n`;
    });

    const outputLanguage = language === 'en' ? 'English' : 'Chinese (中文)';
    userPrompt += `\nAnalyze the evolution. Return ONLY valid JSON. ALL text content must be in ${outputLanguage}.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getSystemPrompt(language) },
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) jsonContent = jsonContent.slice(7);
    else if (jsonContent.startsWith("```")) jsonContent = jsonContent.slice(3);
    if (jsonContent.endsWith("```")) jsonContent = jsonContent.slice(0, -3);
    jsonContent = jsonContent.trim();

    const analysis = JSON.parse(jsonContent);
    const result = { ...analysis, generatedAt: new Date().toISOString(), sourceRoundCount: rounds.length };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-career-growth function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
