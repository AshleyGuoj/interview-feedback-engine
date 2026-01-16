// Interview Analysis Edge Function

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an Interview Summary Agent designed to help job seekers systematically review and improve their interview performance.

Your role is to analyze interview inputs and provide structured, actionable feedback.

Given the interview details, notes, job description (if provided), and resume (if provided), analyze the interview and return a JSON response with the following structure:

{
  "overview": {
    "company": "string",
    "role": "string", 
    "round": "string",
    "interviewFocus": "string (e.g., 'Product Sense & Leadership')",
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
- Each bullet point should be specific and tied to concrete evidence from the notes`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company, role, round, interviewDate, interviewType, interviewContent, jobDescription, resume } = await req.json();

    console.log("Analyzing interview for:", company, role);

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

    userPrompt += `\nProvide your analysis in the exact JSON format specified. Ensure the response is valid JSON only, with no additional text.`;

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

    // Parse the JSON response
    // Handle potential markdown code blocks
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

    console.log("Analysis complete for:", company);

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
