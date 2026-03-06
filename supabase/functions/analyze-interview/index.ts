// Interview Analysis Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function authenticateRequest(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }
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
  
  return `You are an Interview Summary Agent designed to help job seekers systematically review and improve their interview performance.

Your role is to analyze interview inputs and provide structured, actionable feedback.

IMPORTANT: All text content in your response MUST be in ${isEnglish ? 'English' : 'Chinese (中文)'}.

Given the interview details, notes, job description (if provided), and resume (if provided), analyze the interview and return a JSON response with the following structure:

{
  "overview": {
    "company": "string",
    "role": "string", 
    "round": "string",
    "interviewFocus": "string (e.g., '${isEnglish ? 'Product Sense & Leadership' : '产品感与领导力'}')",
    "signalStrength": "Strong" | "Medium" | "Weak"
  },
  "keyStrengths": ["array of 3-5 bullet points explaining what went well with concrete reasoning"],
  "keyRisksAndGaps": ["array of 3-5 bullet points identifying risks, gaps, or weak signals"],
  "alignmentNotes": {
    "whatWorked": ["array of 2-4 points about resume experiences used well"],
    "underusedOrMissing": ["array of 2-4 points about experiences that should have been emphasized"],
    "repositioningAdvice": ["array of 2-3 points on how to reframe experiences next time"]
  },
  "nextRoundPreparation": {
    "likelyQuestionAreas": ["array of 3-5 predicted question topics"],
    "preparationChecklist": ["array of 4-6 specific actionable preparation items"],
    "recommendedStories": ["array of 3-4 specific stories or projects to prepare"]
  },
  "reusableInsights": {
    "companyPreferences": ["array of 2-3 insights about what this company values"],
    "lessonsForFuture": ["array of 2-3 lessons applicable to future interviews"]
  }
}

Guidelines:
- Be honest and direct, but constructive
- Do NOT hallucinate interview details - only analyze what's provided
- If information is missing (no JD or resume), still provide useful analysis but note the limitations
- Prioritize actionable insights over generic advice
- Make the signal strength assessment based on the quality of answers and interviewer signals described
- Each bullet point should be specific and tied to concrete evidence from the notes
- ALL TEXT MUST BE IN ${isEnglish ? 'ENGLISH' : 'CHINESE (中文)'}`;
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { company, role, round, interviewDate, interviewType, interviewContent, jobDescription, resume, language = 'en' } = body;

    // Input validation
    if (!company || typeof company !== 'string' || company.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid company name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!role || typeof role !== 'string' || role.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!interviewContent || typeof interviewContent !== 'string' || interviewContent.length > 50000) {
      return new Response(JSON.stringify({ error: "Invalid or too long interview content (max 50000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > 30000)) {
      return new Response(JSON.stringify({ error: "Job description too long (max 30000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resume && (typeof resume !== 'string' || resume.length > 30000)) {
      return new Response(JSON.stringify({ error: "Resume too long (max 30000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Analyzing interview for:", company, role, "user:", userId, "language:", language);

    // Build the user prompt with all available context
    let userPrompt = `Analyze this interview:\n\n`;
    userPrompt += `**Company:** ${company}\n`;
    userPrompt += `**Role:** ${role}\n`;
    if (round) userPrompt += `**Round:** ${round}\n`;
    if (interviewDate) userPrompt += `**Date:** ${interviewDate}\n`;
    if (interviewType?.length > 0) userPrompt += `**Interview Type/Focus:** ${interviewType.join(", ")}\n`;
    
    userPrompt += `\n**Interview Notes/Transcript:**\n${interviewContent}\n`;
    
    if (jobDescription) {
      userPrompt += `\n**Job Description:**\n${jobDescription}\n`;
    } else {
      userPrompt += `\n(No job description provided - provide analysis based on available information)\n`;
    }
    
    if (resume) {
      userPrompt += `\n**Resume/CV Excerpt:**\n${resume}\n`;
    } else {
      userPrompt += `\n(No resume provided - provide analysis based on available information)\n`;
    }

    userPrompt += `\nProvide your analysis in the exact JSON format specified. Ensure the response is valid JSON only, with no additional text. Remember: ALL text content must be in ${language === 'en' ? 'English' : 'Chinese (中文)'}.`;

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

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
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

    const analysisResult = JSON.parse(jsonContent);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-interview function:", error);
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
