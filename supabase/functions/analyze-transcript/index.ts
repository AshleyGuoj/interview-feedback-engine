// Interview Transcript Analysis Edge Function
// Extracts structured questions and generates reflections from raw interview transcripts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, context } = await req.json();

    if (!transcript || transcript.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Transcript is too short or empty. Please provide a detailed interview transcript." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing transcript, length:", transcript.length);

    // Build user prompt with context
    let userPrompt = `Analyze this interview transcript and extract structured data:\n\n`;
    
    if (context?.company) {
      userPrompt += `**Company:** ${context.company}\n`;
    }
    if (context?.role) {
      userPrompt += `**Role:** ${context.role}\n`;
    }
    if (context?.stage) {
      userPrompt += `**Interview Stage:** ${context.stage}\n`;
    }
    
    userPrompt += `\n=== TRANSCRIPT START ===\n${transcript}\n=== TRANSCRIPT END ===\n\n`;
    userPrompt += `Analyze the above transcript and return your analysis in the exact JSON format specified. Ensure the response is valid JSON only, with no additional text.`;

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
        temperature: 0.3, // Lower temperature for more consistent structured output
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

    // Parse the JSON response, handling markdown code blocks
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

    // Validate the response structure
    if (!analysisResult.questions || !analysisResult.reflection) {
      throw new Error("Invalid response structure from AI");
    }

    console.log("Analysis complete, extracted", analysisResult.questions.length, "questions");

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-transcript function:", error);
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
