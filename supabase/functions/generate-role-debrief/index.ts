// Role Debrief Agent - Aggregates multi-round interview analyses (Layer 2)
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

interface RoundAnalysis {
  roundId: string;
  roundName: string;
  questions: {
    question: string;
    category: string;
    myAnswerSummary?: string;
    responseQuality: 'high' | 'medium' | 'low';
    difficulty: number;
    tags?: string[];
  }[];
  reflection?: {
    overallFeeling: string;
    whatWentWell: string[];
    whatCouldImprove: string[];
    keyTakeaways: string[];
    interviewerVibe?: string;
    companyInsights?: string;
  };
}

interface RoleDebriefRequest {
  jobId: string;
  companyName: string;
  roleTitle: string;
  rounds: RoundAnalysis[];
  language?: string;
}

const getSystemPrompt = (language: string) => {
  const isEnglish = language === 'en';
  
  return `You are a Career Coach AI that aggregates multiple interview round analyses into a comprehensive Role Debrief.

IMPORTANT: All text content in your response MUST be in ${isEnglish ? 'English' : 'Chinese (中文)'}.

Given the multi-round interview data, generate a structured JSON analysis with:

1. **interviewerMapping**: For each round, identify:
   - Background of interviewer (infer from questions: HR, Hiring Manager, Tech Lead, etc.)
   - Focus dimensions (top 2 areas tested)
   - Key highlight (what went well)
   - Key risk (main weakness shown)

2. **competencyHeatmap**: Score these competencies (1-5) based on evidence:
   - product_sense, execution, analytics_metrics, communication, technical_depth
   - AI_skills, system_design, business_strategy, leadership, stress_resilience

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
    { "roundId": "string", "roundName": "string", "interviewerBackground": "string", "focusDimensions": ["string", "string"], "highlight": "string", "risk": "string" }
  ],
  "competencyHeatmap": {
    "product_sense": { "score": 1-5, "evidence": "string" },
    "execution": { "score": 1-5, "evidence": "string" }
  },
  "keyInsights": { "careMost": ["string"], "strengths": ["string"], "risks": ["string"] },
  "hiringLikelihood": { "level": "Low|Medium|High", "confidence": 0.0-1.0, "reasons": ["string"] },
  "nextBestActions": [{ "action": "string", "priority": "high|medium|low", "targetGap": "string" }],
  "roleSummary": "2-3 sentence overall summary"
}

ALL TEXT CONTENT MUST BE IN ${isEnglish ? 'ENGLISH' : 'CHINESE (中文)'}.`;
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

    const { jobId, companyName, roleTitle, rounds, language = 'en' }: RoleDebriefRequest = await req.json();

    // Input validation
    if (!companyName || typeof companyName !== 'string' || companyName.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid company name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!roleTitle || typeof roleTitle !== 'string' || roleTitle.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid role title" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!rounds || rounds.length === 0) {
      throw new Error("No round analyses provided");
    }
    if (rounds.length > 20) {
      return new Response(JSON.stringify({ error: "Too many rounds (max 20)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating role debrief for:", companyName, roleTitle, `(${rounds.length} rounds)`, "user:", userId);

    let userPrompt = `Generate a comprehensive Role Debrief for this job application:\n\n`;
    userPrompt += `**Company:** ${companyName}\n`;
    userPrompt += `**Role:** ${roleTitle}\n`;
    userPrompt += `**Total Rounds:** ${rounds.length}\n\n`;

    rounds.forEach((round, index) => {
      userPrompt += `--- Round ${index + 1}: ${round.roundName} ---\n`;
      if (round.questions && round.questions.length > 0) {
        userPrompt += `Questions (${round.questions.length} total):\n`;
        round.questions.forEach((q, qi) => {
          userPrompt += `  Q${qi + 1}: ${q.question}\n`;
          userPrompt += `    Category: ${q.category}, Quality: ${q.responseQuality}, Difficulty: ${q.difficulty}/5\n`;
          if (q.myAnswerSummary) userPrompt += `    Answer Summary: ${q.myAnswerSummary}\n`;
          if (q.tags?.length) userPrompt += `    Tags: ${q.tags.join(', ')}\n`;
        });
      }
      if (round.reflection) {
        userPrompt += `Reflection:\n`;
        userPrompt += `  Overall Feeling: ${round.reflection.overallFeeling}\n`;
        if (round.reflection.whatWentWell?.length) userPrompt += `  What Went Well: ${round.reflection.whatWentWell.join('; ')}\n`;
        if (round.reflection.whatCouldImprove?.length) userPrompt += `  Areas to Improve: ${round.reflection.whatCouldImprove.join('; ')}\n`;
        if (round.reflection.keyTakeaways?.length) userPrompt += `  Key Takeaways: ${round.reflection.keyTakeaways.join('; ')}\n`;
        if (round.reflection.interviewerVibe) userPrompt += `  Interviewer Vibe: ${round.reflection.interviewerVibe}\n`;
        if (round.reflection.companyInsights) userPrompt += `  Company Insights: ${round.reflection.companyInsights}\n`;
      }
      userPrompt += `\n`;
    });

    const outputLanguage = language === 'en' ? 'English' : 'Chinese (中文)';
    userPrompt += `\nAnalyze all rounds and generate a complete Role Debrief. Return ONLY valid JSON. ALL text content must be in ${outputLanguage}.`;

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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
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

    const debrief = JSON.parse(jsonContent);
    const result = {
      ...debrief,
      jobId,
      companyName,
      roleTitle,
      generatedAt: new Date().toISOString(),
      sourceRoundIds: rounds.map(r => r.roundId),
      roundCount: rounds.length,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-role-debrief function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
