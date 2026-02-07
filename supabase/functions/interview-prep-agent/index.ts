// Interview Preparation AI Agent Edge Function

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getSystemPrompt = (language: string) => {
  const isEnglish = language === 'en';
  
  return `You are an Interview Preparation AI Agent.

Your goal is to maximize interview question prediction accuracy and help the candidate prepare targeted, high-quality answers.

IMPORTANT: All text content in your response MUST be in ${isEnglish ? 'English' : 'Chinese (中文)'}.

Based on the inputs provided, follow this workflow:

STEP 1: Parse the Job Description
- Identify core responsibilities
- Identify key competencies interviewers care about
- Identify role-specific focus areas

STEP 2: Profile the Candidate
- Identify strengths and signature experiences
- Identify potential weak points or risk areas
- Predict where interviewers may challenge the candidate

STEP 3: Analyze Interview Experiences (if provided)
- Deduplicate and cluster interview notes
- Extract high-frequency question topics
- Identify company-specific interview patterns

STEP 4: Reason Across All Inputs
- Combine JD expectations, candidate profile, and real interview patterns
- Prioritize questions that are:
  - Highly likely to be asked
  - High impact on interview outcome

STEP 5: Generate Top 10 Predicted Interview Questions
For each question:
- Explain why it is likely
- Specify which skill it tests
- Reference which inputs support it (JD / Resume / Interview experience)

DESIGN PRINCIPLES:
- Be realistic, not academic
- Do not hallucinate company-specific facts
- Prefer structured reasoning over generic advice
- Optimize for real interview success

Return your analysis in this JSON format:
{
  "jdAnalysis": {
    "coreResponsibilities": ["string"],
    "keyCompetencies": ["string"],
    "focusAreas": ["string"]
  },
  "candidateProfile": {
    "strengths": ["string"],
    "signatureExperiences": ["string"],
    "potentialWeakPoints": ["string"],
    "likelyChallengeAreas": ["string"]
  },
  "interviewPatterns": {
    "highFrequencyTopics": ["string"],
    "companySpecificPatterns": ["string"]
  },
  "predictedQuestions": [
    {
      "rank": 1,
      "question": "string",
      "whyLikely": "string",
      "skillTested": "string",
      "sourceReference": "JD" | "Resume" | "Interview Experience" | "Combined"
    }
  ]
}

ALL TEXT CONTENT MUST BE IN ${isEnglish ? 'ENGLISH' : 'CHINESE (中文)'}.`;
};

const getMockInterviewPrompt = (language: string) => {
  const isEnglish = language === 'en';
  
  return `You are conducting a mock interview. You have already analyzed the candidate's profile and predicted likely questions.

Your role:
1. Ask one question at a time
2. Listen to the candidate's answer
3. Ask relevant follow-up questions to probe deeper (1-2 follow-ups per main question)
4. After the candidate finishes answering, provide brief feedback on:
   - Clarity: How clear and structured was the answer?
   - Depth: Did they provide enough detail and examples?
   - Relevance: Did they address what interviewers actually care about?
   - Improvement tips: Specific suggestions for a better answer

Be encouraging but honest. Focus on actionable feedback.

IMPORTANT: Respond in ${isEnglish ? 'English' : 'Chinese (中文)'}.`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, resume, jobDescription, interviewNotes, conversationHistory, analysisContext, language = 'en' } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (mode === "analyze") {
      // Analysis mode: Generate predicted questions
      console.log("Analyzing interview preparation for JD, language:", language);

      const outputLanguage = language === 'en' ? 'English' : 'Chinese (中文)';
      let userPrompt = `Please analyze the following inputs and generate interview preparation insights:\n\n`;
      userPrompt += `**Job Description:**\n${jobDescription}\n\n`;
      userPrompt += `**Candidate Resume:**\n${resume}\n\n`;
      
      if (interviewNotes) {
        userPrompt += `**Interview Experience Notes (from platforms like Xiaohongshu/Niuke):**\n${interviewNotes}\n\n`;
      } else {
        userPrompt += `(No interview experience notes provided)\n\n`;
      }

      userPrompt += `Please provide your analysis in the exact JSON format specified. Ensure the response is valid JSON only. ALL text content must be in ${outputLanguage}.`;

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
          max_tokens: 6000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in AI response");
      }

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

      const analysisResult = JSON.parse(jsonContent);

      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (mode === "mock-interview") {
      // Mock interview mode: Conversational
      console.log("Mock interview mode, language:", language);

      const messages = [
        { 
          role: "system", 
          content: getMockInterviewPrompt(language) + `\n\nContext from analysis:\n${JSON.stringify(analysisContext, null, 2)}` 
        },
        ...conversationHistory,
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI API error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in interview-prep-agent:", error);
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
