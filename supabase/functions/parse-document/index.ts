// Document Parsing Edge Function using Gemini Vision
// Supports single and multi-page documents

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentPage {
  imageBase64: string;
  mimeType: string;
  fileName: string;
  pageNumber?: number;
}

async function extractTextFromImage(
  page: DocumentPage,
  apiKey: string
): Promise<string> {
  const prompt = `Please extract ALL text content from this document/image (Page ${page.pageNumber || 1}).
If it's a resume, extract all sections including contact info, education, experience, skills, projects, etc.
If it's a job description, extract all requirements, responsibilities, qualifications, company info, etc.
If it's interview notes, extract all questions, answers, feedback mentioned.

Return ONLY the extracted text content, well-formatted and organized. Do not add any commentary or analysis.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${page.mimeType};base64,${page.imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error for page", page.pageNumber, ":", errorText);
    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  const extractedText = aiResponse.choices?.[0]?.message?.content;

  if (!extractedText) {
    throw new Error(`No text extracted from page ${page.pageNumber || 1}`);
  }

  return extractedText;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Support both single document and multi-page documents
    const pages: DocumentPage[] = body.pages || [
      {
        imageBase64: body.imageBase64,
        mimeType: body.mimeType,
        fileName: body.fileName,
        pageNumber: 1,
      },
    ];

    if (!pages.length || !pages[0].imageBase64) {
      throw new Error("No document data provided");
    }

    console.log("Parsing document with", pages.length, "page(s)");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Process all pages
    const extractedTexts: string[] = [];
    
    for (let i = 0; i < pages.length; i++) {
      const page = { ...pages[i], pageNumber: i + 1 };
      console.log(`Processing page ${i + 1}/${pages.length}: ${page.fileName}`);
      
      try {
        const text = await extractTextFromImage(page, LOVABLE_API_KEY);
        extractedTexts.push(text);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "RATE_LIMIT") {
            return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (error.message === "PAYMENT_REQUIRED") {
            return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        console.error(`Error processing page ${i + 1}:`, error);
        extractedTexts.push(`[Page ${i + 1}: Failed to extract text]`);
      }
    }

    // Combine all extracted texts
    let combinedText: string;
    if (pages.length === 1) {
      combinedText = extractedTexts[0];
    } else {
      combinedText = extractedTexts
        .map((text, i) => `--- Page ${i + 1} ---\n${text}`)
        .join("\n\n");
    }

    console.log("Successfully extracted text from", pages.length, "page(s)");

    return new Response(JSON.stringify({ 
      text: combinedText,
      pageCount: pages.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in parse-document:", error);
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
