import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

const getSystemPrompt = (language: string) => {
  const isEnglish = language === 'en';
  
  return `You are a Career Signal Timeline Intelligence Agent.

Your task is to transform raw job search events into a meaningful,
decision-oriented career timeline that helps users understand
how their interview signals evolve over time.

IMPORTANT: All text content in your response MUST be in ${isEnglish ? 'English' : 'Chinese (中文)'}.

==============================
OUTPUT FORMAT (JSON ONLY)
==============================

Return ONLY valid JSON with this structure:

{
  "timelinePurpose": "Career Signal Timeline",
  "timelineItems": [
    {
      "date": "YYYY-MM-DD",
      "type": "strong_signal | medium_signal | weak_signal | turning_point",
      "title": "short, human-readable title",
      "context": { "company": "string or null", "role": "string or null" },
      "signalSummary": "what signal appeared",
      "whyItMatters": "why this event changes understanding",
      "confidence": "high | medium | low"
    }
  ],
  "recentPatterns": [
    { "pattern": "string", "evidence": "string", "riskLevel": "low | medium | high" }
  ],
  "momentumStatus": { "state": "improving | flat | declining", "explanation": "string" },
  "coachNote": "string"
}

- Concise and insight-driven
- Honest and evidence-based
- ALL TEXT CONTENT MUST BE IN ${isEnglish ? 'ENGLISH' : 'CHINESE (中文)'}

Do not include explanations outside of the JSON.`;
};

interface JobEvent {
  jobId: string;
  company: string;
  role: string;
  eventType: string;
  date: string;
  stageName?: string;
  stageStatus?: string;
  stageResult?: string;
  questions?: Array<{ category: string; answeredWell?: boolean; }>;
  reflection?: { overallFeeling: string; keyTakeaways: string[]; };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    let userId: string;
    try {
      userId = await authenticateRequest(req);
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { events, language = 'en' } = await req.json() as { events: JobEvent[]; language?: string };

    if (!events || events.length === 0) {
      const noDataMessage = language === 'en' 
        ? "Start recording your interviews to see AI-powered career signals."
        : "开始记录你的面试经历，AI将帮助你发现职业发展中的关键信号和模式。";
      return new Response(
        JSON.stringify({
          timelinePurpose: "Career Signal Timeline",
          timelineItems: [],
          recentPatterns: [],
          momentumStatus: { state: "flat", explanation: language === 'en' ? "Not enough data" : "暂无足够数据" },
          coachNote: noDataMessage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (events.length > 200) {
      return new Response(JSON.stringify({ error: "Too many events (max 200)" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Analyzing career signals for", events.length, "events", "user:", userId);

    const eventsContext = events.map(e => {
      let eventDesc = `[${e.date}] ${e.company} - ${e.role}: ${e.eventType}`;
      if (e.stageName) eventDesc += ` (${e.stageName})`;
      if (e.stageStatus) eventDesc += ` Status: ${e.stageStatus}`;
      if (e.stageResult) eventDesc += ` Result: ${e.stageResult}`;
      if (e.questions && e.questions.length > 0) {
        const wellAnswered = e.questions.filter(q => q.answeredWell === true).length;
        const poorlyAnswered = e.questions.filter(q => q.answeredWell === false).length;
        eventDesc += ` Questions: ${e.questions.length} total, ${wellAnswered} well, ${poorlyAnswered} poor`;
        const categories = [...new Set(e.questions.map(q => q.category))];
        eventDesc += ` Categories: ${categories.join(', ')}`;
      }
      if (e.reflection) {
        eventDesc += ` Feeling: ${e.reflection.overallFeeling}`;
        if (e.reflection.keyTakeaways.length > 0) eventDesc += ` Takeaways: ${e.reflection.keyTakeaways.join('; ')}`;
      }
      return eventDesc;
    }).join('\\n');

    const outputLanguage = language === 'en' ? 'English' : 'Chinese (中文)';
    const userPrompt = `Analyze these career events and produce a signal-based timeline:\\n\\n${eventsContext}\\n\\nOutput ALL text in ${outputLanguage}. Return ONLY valid JSON.`;

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
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI proxy error:', errorText);
      throw new Error(`AI proxy failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content in AI response');

    let parsedResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-career-signals:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        timelinePurpose: "Career Signal Timeline",
        timelineItems: [],
        recentPatterns: [],
        momentumStatus: { state: "flat", explanation: "An error occurred during analysis" },
        coachNote: "Unable to generate signal analysis. Please try again."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
