// Interview Transcript Analysis Edge Function
// Extracts structured questions and generates reflections from raw interview transcripts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const getSystemPrompt = (language: string) => {
  const isEnglish = language === 'en';
  const langLabel = isEnglish ? 'English' : '中文';
  const langMust = isEnglish ? 'MUST BE IN ENGLISH' : '必须用中文，禁止出现英文';

  // Field descriptions switch by language
  const questionDesc = isEnglish
    ? 'string - the core question asked (in English)'
    : 'string - 面试官提问的核心问题（必须用中文）';
  const answerDesc = isEnglish
    ? 'string - brief summary of how the candidate answered (in English)'
    : 'string - 候选人回答的简要总结（必须用中文）';
  const evalDesc = isEnglish
    ? 'string - what the interviewer was really testing (in English)'
    : 'string - 面试官真正考察的核心能力（必须用中文）';
  const qualityDesc = isEnglish
    ? 'string - why this quality rating (in English)'
    : 'string - 该质量评级的原因说明（必须用中文）';
  const tagsExample = isEnglish
    ? '["Product Sense", "Leadership", "Data Analysis", "System Design"]'
    : '["产品思维", "领导力", "数据分析", "系统设计", "跨团队协作"]';
  const perfSummaryDesc = isEnglish
    ? 'string - 2-3 sentence overall assessment (in English)'
    : 'string - 2-3句话的整体表现评价（必须用中文）';
  const whatWentWellDesc = isEnglish
    ? 'array of specific things the candidate did well (in English)'
    : '候选人表现出色的具体事项列表（每条必须用中文）';
  const improveDesc = isEnglish
    ? 'array of actionable improvement suggestions (in English)'
    : '可操作的改进建议列表（每条必须用中文）';
  const takeawaysDesc = isEnglish
    ? 'array of lessons learned from this interview (in English)'
    : '本次面试的关键收获列表（每条必须用中文）';
  const vibeDesc = isEnglish
    ? 'string - description of the interviewer\'s style and focus (in English)'
    : 'string - 面试官风格与关注点的描述（必须用中文）';
  const insightsDesc = isEnglish
    ? 'string - any new learnings about the company/team/role (in English)'
    : 'string - 对公司/团队/岗位的新认知（必须用中文）';
  const difficultyDesc = isEnglish
    ? 'string - easy/medium/hard assessment (in English)'
    : 'string - 难度评估：简单/中等/困难（用中文）';

  return `You are an expert interview analysis assistant that helps job seekers extract structured data from raw interview transcripts.

Your task is to analyze messy, unstructured interview transcripts (which may be in mixed Chinese/English) and generate:

1. **Structured Interview Questions** - Extract each distinct question asked by the interviewer
2. **Interview Reflection** - Generate a comprehensive reflection based on the full transcript

🚨 CRITICAL LANGUAGE RULE: ALL natural-language text fields in your JSON response MUST be written in ${langLabel}. This includes question text, summaries, tags, reasoning, and all reflection fields. DO NOT use English for any text field when the target language is 中文.

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
      "question": "${questionDesc}",
      "category": "behavioral" | "technical" | "situational" | "case" | "motivation" | "other",
      "myAnswerSummary": "${answerDesc}",
      "evaluationFocus": "${evalDesc}",
      "responseQuality": "high" | "medium" | "low",
      "qualityReasoning": "${qualityDesc}",
      "difficulty": 1-5,
      "tags": ${tagsExample}
    }
  ],
  "reflection": {
    "overallFeeling": "great" | "good" | "neutral" | "poor" | "bad",
    "performanceSummary": "${perfSummaryDesc}",
    "whatWentWell": ["${whatWentWellDesc}"],
    "whatCouldImprove": ["${improveDesc}"],
    "keyTakeaways": ["${takeawaysDesc}"],
    "interviewerVibe": "${vibeDesc}",
    "companyInsights": "${insightsDesc}"
  },
  "metadata": {
    "totalQuestions": number,
    "dominantCategory": "string - most common question type",
    "overallDifficulty": "${difficultyDesc}",
    "languageDetected": "string - primary language of the transcript"
  }
}

Be thorough but concise. Focus on actionable insights over generic observations.

🔒 FINAL LANGUAGE ENFORCEMENT: Every single text value in the JSON above ${langMust}. Tags, question text, summaries, reasoning, reflections — ALL of them. No exceptions.`;
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, context, language = 'en' } = await req.json();

    if (!transcript || transcript.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Transcript is too short or empty. Please provide a detailed interview transcript." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing transcript, length:", transcript.length, "language:", language);

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
    
    const outputLanguage = language === 'en' ? 'English' : '中文';
    const langEnforcement = language === 'en'
      ? 'ALL text values (question, myAnswerSummary, evaluationFocus, qualityReasoning, tags, and all reflection fields) MUST be in English.'
      : '所有文本字段（question、myAnswerSummary、evaluationFocus、qualityReasoning、tags 标签、以及所有 reflection 字段）必须全部用中文书写，严禁出现英文单词或短语（专有名词如公司名、技术缩写 AI/SQL/PM 除外）。';
    userPrompt += `\n=== TRANSCRIPT START ===\n${transcript}\n=== TRANSCRIPT END ===\n\n`;
    userPrompt += `Analyze the above transcript and return your analysis in the exact JSON format specified. Ensure the response is valid JSON only, with no additional text.\n\n🔒 LANGUAGE REQUIREMENT: Output language is ${outputLanguage}. ${langEnforcement}`;

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
