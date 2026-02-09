import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has jobs
    const { count, error: countError } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return new Response(
        JSON.stringify({ seeded: false, reason: "already_has_data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const now = new Date();
    const d = (daysAgo: number) =>
      new Date(now.getTime() - daysAgo * 86400000).toISOString();
    const future = (daysAhead: number) =>
      new Date(now.getTime() + daysAhead * 86400000).toISOString();

    // ========== Job 1: Google - Senior PM (interviewing) ==========
    const googleStages = [
      {
        id: "demo-g1",
        name: "Applied",
        status: "completed",
        result: "passed",
        date: d(28),
      },
      {
        id: "demo-g2",
        name: "HR Screen",
        status: "completed",
        result: "passed",
        scheduledTime: d(21),
        interviewer: "Sarah Chen, Recruiter",
        feedbackScore: 4,
        questions: [
          {
            id: "q-g1",
            question: "Walk me through your PM experience and why Google?",
            category: "motivation",
            difficulty: 2,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Talked about my 4 years building B2B SaaS products, passion for search/AI, and how Google's scale matches my ambition to impact billions.",
          },
          {
            id: "q-g2",
            question:
              "Tell me about a time you had to make a difficult prioritization decision.",
            category: "behavioral",
            difficulty: 3,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Used the RICE framework story from my current role — deprioritized a CEO-requested feature in favor of a retention-critical fix. Showed data-driven decision making.",
          },
        ],
        reflection: {
          overallFeeling: "good",
          whatWentWell: [
            "Strong rapport with recruiter",
            "Clear articulation of PM philosophy",
          ],
          whatCouldImprove: [
            "Could have asked more about team culture",
          ],
          keyTakeaways: [
            "Google values structured thinking",
            "They're hiring for a new AI-powered search feature",
          ],
        },
      },
      {
        id: "demo-g3",
        name: "Technical Round",
        status: "completed",
        result: "passed",
        scheduledTime: d(14),
        interviewer: "Mike Zhang, Senior Engineer",
        feedbackScore: 4,
        questions: [
          {
            id: "q-g3",
            question:
              "Design a system to detect and rank duplicate search results.",
            category: "technical",
            difficulty: 4,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Proposed a pipeline: content fingerprinting → similarity scoring → cluster ranking. Discussed trade-offs between precision and recall.",
          },
          {
            id: "q-g4",
            question:
              "How would you measure the success of a search quality improvement?",
            category: "technical",
            difficulty: 3,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Defined primary metrics (NDCG, click-through rate) and guardrail metrics (query abandonment rate, time to first click).",
          },
        ],
        reflection: {
          overallFeeling: "good",
          whatWentWell: [
            "Strong system design thinking",
            "Good metric framework",
          ],
          whatCouldImprove: [
            "Should have drawn more diagrams",
            "Rushed the edge cases section",
          ],
          keyTakeaways: [
            "Technical bar is high but fair",
            "They value clarity over completeness",
          ],
        },
      },
      {
        id: "demo-g4",
        name: "Product Sense",
        status: "completed",
        result: "passed",
        scheduledTime: d(7),
        interviewer: "Lisa Wang, Group PM",
        feedbackScore: 5,
        questions: [
          {
            id: "q-g5",
            question:
              "How would you improve Google Maps for commuters in emerging markets?",
            category: "case",
            difficulty: 4,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Segmented users by commute type, identified offline-first as key constraint, proposed lightweight transit predictions using crowdsourced data.",
          },
        ],
        reflection: {
          overallFeeling: "great",
          whatWentWell: [
            "Strong user empathy",
            "Creative solution with offline-first approach",
            "Interviewer was visibly impressed",
          ],
          whatCouldImprove: [
            "Could quantify TAM better",
          ],
          keyTakeaways: [
            "Product sense round is the differentiator",
            "Lisa mentioned team is growing fast — good sign",
          ],
        },
      },
      {
        id: "demo-g5",
        name: "Cross-functional Round",
        status: "scheduled",
        scheduledTime: future(3),
        interviewer: "David Park, Director of Engineering",
      },
      {
        id: "demo-g6",
        name: "Offer Discussion",
        status: "pending",
      },
    ];

    const googleJob = {
      user_id: userId,
      company_name: "Google",
      role_title: "Senior Product Manager",
      location: "US",
      status: "interviewing",
      source: "referral",
      interest_level: 5,
      career_fit_notes:
        "Dream role — AI-powered search product. Strong referral from college friend on the team. TC range $280-350K. Team is 15 engineers, 2 designers.",
      created_at: d(28),
      updated_at: d(1),
      stages: {
        list: googleStages,
        _metadata: {
          pipelines: [
            {
              id: "demo-pipe-g1",
              type: "primary",
              status: "active",
              targetRole: "Senior Product Manager",
              stages: googleStages,
              createdAt: d(28),
            },
          ],
          subStatus: "interview_scheduled",
          riskTags: ["competing_offer"],
        },
      },
    };

    // ========== Job 2: TikTok - PM (offer — the Aha Moment) ==========
    const tiktokStages = [
      {
        id: "demo-t1",
        name: "Applied",
        status: "completed",
        result: "passed",
        date: d(35),
      },
      {
        id: "demo-t2",
        name: "HR Screen",
        status: "completed",
        result: "passed",
        scheduledTime: d(30),
        interviewer: "Jenny Liu, Talent Partner",
        feedbackScore: 4,
        questions: [
          {
            id: "q-t1",
            question: "Why TikTok? What excites you about short-form video?",
            category: "motivation",
            difficulty: 2,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Discussed how TikTok's recommendation engine is reshaping content discovery, and my experience with engagement-driven product loops.",
          },
        ],
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Showed genuine passion for the product"],
          whatCouldImprove: ["Ask more about work-life balance"],
          keyTakeaways: ["Fast-paced culture, ship weekly"],
        },
      },
      {
        id: "demo-t3",
        name: "Product Design Round",
        status: "completed",
        result: "passed",
        scheduledTime: d(22),
        interviewer: "Kevin Xu, Staff PM",
        feedbackScore: 4,
        questions: [
          {
            id: "q-t2",
            question:
              "Design a feature to help creators monetize on TikTok.",
            category: "case",
            difficulty: 4,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Proposed a tiered 'Creator Marketplace' connecting brands with creators based on niche audience match. Included revenue model and success metrics.",
          },
        ],
        reflection: {
          overallFeeling: "good",
          whatWentWell: [
            "Strong business model thinking",
            "Good competitive analysis vs YouTube",
          ],
          whatCouldImprove: ["More focus on creator experience"],
          keyTakeaways: [
            "TikTok PM culture is very metrics-driven",
          ],
        },
      },
      {
        id: "demo-t4",
        name: "Hiring Manager Round",
        status: "completed",
        result: "passed",
        scheduledTime: d(15),
        interviewer: "Amy Zhang, Director of Product",
        feedbackScore: 5,
        questions: [
          {
            id: "q-t3",
            question:
              "How do you handle disagreements with engineering leads?",
            category: "behavioral",
            difficulty: 3,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Shared a real story about navigating a technical feasibility disagreement, building trust through data and prototyping.",
          },
        ],
        reflection: {
          overallFeeling: "great",
          whatWentWell: [
            "Amazing chemistry with hiring manager",
            "She shared team roadmap — strong buy signal",
          ],
          whatCouldImprove: [],
          keyTakeaways: [
            "Team owns TikTok Shop creator tools",
            "Headcount is growing, urgent to fill",
          ],
        },
      },
      {
        id: "demo-t5",
        name: "Offer Discussion",
        status: "completed",
        result: "passed",
        scheduledTime: d(5),
        interviewer: "Jenny Liu, Talent Partner",
        feedbackScore: 5,
        reflection: {
          overallFeeling: "great",
          whatWentWell: [
            "Offer is competitive",
            "Signing bonus included",
          ],
          whatCouldImprove: [],
          keyTakeaways: [
            "Base: $185K, RSU: $200K/4yr, Sign-on: $30K",
            "Need to respond within 2 weeks",
            "Can try negotiating RSU with competing Google offer",
          ],
        },
      },
    ];

    const tiktokJob = {
      user_id: userId,
      company_name: "TikTok",
      role_title: "Product Manager",
      location: "US",
      status: "offer",
      source: "linkedin",
      interest_level: 4,
      career_fit_notes:
        "Offer received! Base $185K + RSU $200K/4yr + $30K sign-on. Strong team, fast growth. Concern: work-life balance and ByteDance culture. Deadline to respond: 2 weeks.",
      created_at: d(35),
      updated_at: d(1),
      stages: {
        list: tiktokStages,
        _metadata: {
          pipelines: [
            {
              id: "demo-pipe-t1",
              type: "primary",
              status: "completed",
              targetRole: "Product Manager",
              stages: tiktokStages,
              createdAt: d(35),
            },
          ],
          subStatus: "offer_received",
        },
      },
    };

    // ========== Job 3: Stripe - APM (closed, rejected) ==========
    const stripeStages = [
      {
        id: "demo-s1",
        name: "Applied",
        status: "completed",
        result: "passed",
        date: d(42),
      },
      {
        id: "demo-s2",
        name: "Recruiter Call",
        status: "completed",
        result: "passed",
        scheduledTime: d(38),
        interviewer: "Tom Baker, University Recruiter",
        feedbackScore: 4,
        questions: [
          {
            id: "q-s1",
            question:
              "What's your understanding of Stripe's business model?",
            category: "motivation",
            difficulty: 2,
            wasAsked: true,
            answeredWell: true,
            myAnswer:
              "Explained payments infrastructure, developer-first approach, and expansion into financial services (Treasury, Atlas, Radar).",
          },
        ],
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Strong knowledge of fintech ecosystem"],
          whatCouldImprove: ["Should have asked about APM program structure"],
          keyTakeaways: ["APM program is very competitive, ~5% acceptance"],
        },
      },
      {
        id: "demo-s3",
        name: "Product Exercise",
        status: "completed",
        result: "passed",
        scheduledTime: d(30),
        interviewer: "Rachel Kim, PM",
        feedbackScore: 3,
        questions: [
          {
            id: "q-s2",
            question:
              "Take-home: Design an onboarding flow for Stripe Atlas international users.",
            category: "case",
            difficulty: 5,
            wasAsked: true,
            answeredWell: false,
            myAnswer:
              "Submitted a 6-page doc with wireframes. Felt the regulatory compliance section was weak — didn't research enough on international banking requirements.",
          },
        ],
        reflection: {
          overallFeeling: "neutral",
          whatWentWell: ["Good wireframes", "Strong user research section"],
          whatCouldImprove: [
            "Regulatory knowledge gap was obvious",
            "Should have spent more time on edge cases",
          ],
          keyTakeaways: [
            "Stripe cares deeply about precision and edge cases",
            "APM bar is extremely high for product craft",
          ],
        },
      },
      {
        id: "demo-s4",
        name: "Final Panel",
        status: "completed",
        result: "rejected",
        scheduledTime: d(22),
        interviewer: "Panel: 3 PMs + 1 Engineer",
        feedbackScore: 2,
        reflection: {
          overallFeeling: "poor",
          whatWentWell: [
            "Good rapport with individual interviewers",
          ],
          whatCouldImprove: [
            "Struggled with the rapid-fire product critique exercise",
            "Need to practice live product teardowns",
            "Got nervous during the metrics deep-dive",
          ],
          keyTakeaways: [
            "Panel format is intense — need more mock practice",
            "Stripe expects near-perfect analytical rigor",
            "Still valuable: learned my weak spots in fintech PM skills",
          ],
        },
      },
    ];

    const stripeJob = {
      user_id: userId,
      company_name: "Stripe",
      role_title: "Associate Product Manager",
      location: "US",
      status: "closed",
      source: "website",
      interest_level: 4,
      career_fit_notes:
        "Rejected after final panel. Key learning: need stronger analytical rigor for fintech roles. The take-home exercise feedback was constructive — keep the wireframes for portfolio. Completed 3 of 4 stages.",
      created_at: d(42),
      updated_at: d(20),
      stages: {
        list: stripeStages,
        _metadata: {
          pipelines: [
            {
              id: "demo-pipe-s1",
              type: "primary",
              status: "closed",
              targetRole: "Associate Product Manager",
              stages: stripeStages,
              createdAt: d(42),
              closedAt: d(20),
              closedReason: "rejected_after_interview",
            },
          ],
          closedReason: "rejected_after_interview",
        },
      },
    };

    // Insert jobs
    const { data: insertedJobs, error: jobsError } = await supabase
      .from("jobs")
      .insert([googleJob, tiktokJob, stripeJob])
      .select("id, company_name");

    if (jobsError) throw jobsError;

    // Build activity entries
    const jobMap: Record<string, string> = {};
    for (const j of insertedJobs || []) {
      jobMap[j.company_name] = j.id;
    }

    const activities = [
      {
        user_id: userId,
        job_id: jobMap["Stripe"],
        type: "application",
        message: "Applied to Stripe — Associate Product Manager",
        created_at: d(42),
      },
      {
        user_id: userId,
        job_id: jobMap["TikTok"],
        type: "application",
        message: "Applied to TikTok — Product Manager",
        created_at: d(35),
      },
      {
        user_id: userId,
        job_id: jobMap["Google"],
        type: "application",
        message: "Applied to Google — Senior Product Manager",
        created_at: d(28),
      },
      {
        user_id: userId,
        job_id: jobMap["Stripe"],
        type: "stage_update",
        message: "Rejected after Final Panel at Stripe",
        created_at: d(22),
      },
      {
        user_id: userId,
        job_id: jobMap["Google"],
        type: "stage_update",
        message: "Product Sense round completed at Google — passed!",
        created_at: d(7),
      },
      {
        user_id: userId,
        job_id: jobMap["TikTok"],
        type: "offer",
        message:
          "🎉 Received offer from TikTok — Product Manager ($185K base)",
        created_at: d(5),
      },
      {
        user_id: userId,
        job_id: jobMap["Google"],
        type: "stage_update",
        message: "Cross-functional round scheduled at Google",
        created_at: d(1),
      },
    ];

    const { error: actError } = await supabase
      .from("recent_activities")
      .insert(activities);

    if (actError) throw actError;

    return new Response(JSON.stringify({ seeded: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("seed-demo-data error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
