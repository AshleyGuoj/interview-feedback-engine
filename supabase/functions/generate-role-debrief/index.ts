// Role Debrief Agent - Aggregates multi-round interview analyses (Layer 2)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
}

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, companyName, roleTitle, rounds }: RoleDebriefRequest = await req.json();

    console.log("Generating role debrief for:", companyName, roleTitle, `(${rounds.length} rounds)`);

    if (!rounds || rounds.length === 0) {
      throw new Error("No round analyses provided");
    }

    // Build user prompt with all round data
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
          if (q.myAnswerSummary) {
            userPrompt += `    Answer Summary: ${q.myAnswerSummary}\n`;
          }
          if (q.tags?.length) {
            userPrompt += `    Tags: ${q.tags.join(', ')}\n`;
          }
        });
      }

      if (round.reflection) {
        userPrompt += `Reflection:\n`;
        userPrompt += `  Overall Feeling: ${round.reflection.overallFeeling}\n`;
        if (round.reflection.whatWentWell?.length) {
          userPrompt += `  What Went Well: ${round.reflection.whatWentWell.join('; ')}\n`;
        }
        if (round.reflection.whatCouldImprove?.length) {
          userPrompt += `  Areas to Improve: ${round.reflection.whatCouldImprove.join('; ')}\n`;
        }
        if (round.reflection.keyTakeaways?.length) {
          userPrompt += `  Key Takeaways: ${round.reflection.keyTakeaways.join('; ')}\n`;
        }
        if (round.reflection.interviewerVibe) {
          userPrompt += `  Interviewer Vibe: ${round.reflection.interviewerVibe}\n`;
        }
        if (round.reflection.companyInsights) {
          userPrompt += `  Company Insights: ${round.reflection.companyInsights}\n`;
        }
      }
      userPrompt += `\n`;
    });

    userPrompt += `\nAnalyze all rounds and generate a complete Role Debrief. Return ONLY valid JSON.`;

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

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content);

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

    const debrief = JSON.parse(jsonContent);

    // Add metadata
    const result = {
      ...debrief,
      jobId,
      companyName,
      roleTitle,
      generatedAt: new Date().toISOString(),
      sourceRoundIds: rounds.map(r => r.roundId),
      roundCount: rounds.length,
    };

    console.log("Role debrief generated successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-role-debrief function:", error);
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
