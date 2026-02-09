import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Question banks per round ──

const googleHRQuestions = [
  { id: "q-g-hr1", question: "Walk me through your PM experience and why Google?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Talked about my 4 years building B2B SaaS products, passion for search/AI, and how Google's scale matches my ambition to impact billions." },
  { id: "q-g-hr2", question: "Tell me about a time you had to make a difficult prioritization decision.", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Used the RICE framework story from my current role — deprioritized a CEO-requested feature in favor of a retention-critical fix. Showed data-driven decision making." },
  { id: "q-g-hr3", question: "How do you define a successful product launch?", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Defined success across three dimensions: user adoption metrics (DAU/MAU), business impact (revenue/conversion), and quality (crash rate, NPS). Gave example of my last launch hitting 120% of adoption target." },
  { id: "q-g-hr4", question: "Describe a situation where you had to influence without authority.", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Shared story of convincing the design team to adopt a new design system by running a pilot, showing 30% faster delivery, and presenting results at the design review." },
  { id: "q-g-hr5", question: "What's a product you use daily that you'd improve?", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Chose Google Maps — suggested adding real-time crowd density for public transit stops using anonymized location data. Drew quick user flow." },
  { id: "q-g-hr6", question: "How do you handle disagreements with engineers about technical feasibility?", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Described a real case where I proposed a simpler MVP scope that addressed 80% of user needs, built trust by acknowledging technical debt, and scheduled a follow-up iteration." },
  { id: "q-g-hr7", question: "Tell me about a product you built from 0 to 1.", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Walked through building an internal analytics dashboard: user research, PRD, working with 3 engineers, launch to 200 internal users, iterating based on feedback." },
  { id: "q-g-hr8", question: "What's your approach to understanding user needs?", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Described my framework: quantitative (analytics, A/B tests) + qualitative (user interviews, support tickets). Gave example of discovering a hidden pain point through support ticket analysis." },
  { id: "q-g-hr9", question: "Why are you leaving your current role?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Framed positively — seeking larger scale impact, AI-first products, and working with world-class engineering teams. Emphasized growth, not escape." },
  { id: "q-g-hr10", question: "Where do you see yourself in 5 years?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Aspire to lead a product area at a top tech company, building AI products that serve global users. Mentioned interest in mentoring junior PMs." },
];

const googleTechQuestions = [
  { id: "q-g-t1", question: "Design a system to detect and rank duplicate search results.", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed a pipeline: content fingerprinting → similarity scoring → cluster ranking. Discussed trade-offs between precision and recall." },
  { id: "q-g-t2", question: "How would you measure the success of a search quality improvement?", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Defined primary metrics (NDCG, click-through rate) and guardrail metrics (query abandonment rate, time to first click)." },
  { id: "q-g-t3", question: "Explain how you'd design an A/B testing framework for search ranking changes.", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Outlined: traffic splitting by query type, interleaving experiments for ranking, statistical significance thresholds, and guardrail metrics to prevent degradation." },
  { id: "q-g-t4", question: "How would you handle latency vs. relevance trade-offs in real-time search?", category: "technical", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Discussed caching strategies and tiered ranking (fast first-pass + slower re-ranking), but struggled to quantify acceptable latency budgets." },
  { id: "q-g-t5", question: "Walk me through how you'd debug a 10% drop in search click-through rate.", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Systematic approach: segment by device/geo/query type, check for deployment changes, analyze query distribution shifts, compare SERP layouts. Found it was a UI change affecting mobile." },
  { id: "q-g-t6", question: "How would you design a personalized search experience without compromising privacy?", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed on-device personalization, federated learning, and differential privacy. Gave examples of how Apple does this with Siri suggestions." },
  { id: "q-g-t7", question: "Describe a technical architecture for real-time autocomplete suggestions.", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Trie-based data structure with popularity weighting, CDN edge caching for top queries, and a fallback ML model for long-tail queries." },
  { id: "q-g-t8", question: "How do you decide between building in-house vs. using a third-party service?", category: "technical", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Framework: strategic importance, maintenance cost, data sensitivity, and time-to-market. Gave example of choosing to build in-house analytics vs. using Amplitude." },
  { id: "q-g-t9", question: "What's your experience with ML-powered product features?", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Built a recommendation engine for content feeds. Worked with ML engineers on feature engineering, model evaluation, and online/offline metric alignment." },
  { id: "q-g-t10", question: "How would you prioritize technical debt vs. new features?", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Use a risk-weighted approach: quantify tech debt impact on velocity, set a 20% sprint budget for debt, and escalate critical debt items that block features." },
];

const googleProductQuestions = [
  { id: "q-g-p1", question: "How would you improve Google Maps for commuters in emerging markets?", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Segmented users by commute type, identified offline-first as key constraint, proposed lightweight transit predictions using crowdsourced data." },
  { id: "q-g-p2", question: "Design a feature to help small businesses get discovered on Google Search.", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed 'Local Spotlight' — AI-curated business profiles with real-time availability, reviews summary, and one-click actions. Monetization through promoted placements." },
  { id: "q-g-p3", question: "How would you decide between two competing feature requests from different user segments?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Framework: segment size × frequency of need × strategic alignment × implementation cost. Built a scoring matrix and used it to justify the decision." },
  { id: "q-g-p4", question: "What metrics would you track for YouTube Shorts?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "North star: daily active creators. Supporting metrics: average watch time, creation-to-publish rate, share rate, creator retention D7/D30." },
  { id: "q-g-p5", question: "Design a notification system that reduces notification fatigue.", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed ML-based notification bundling, user-controlled quiet hours, urgency classification, and a 'notification health score' dashboard for PMs." },
  { id: "q-g-p6", question: "How would you improve Google Classroom for teachers?", category: "case", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Interviewed 5 teachers in prep. Key pain: grading workflow. Proposed AI-assisted rubric grading, batch feedback templates, and parent communication hub." },
  { id: "q-g-p7", question: "A new feature launched but adoption is 50% below target. What do you do?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Step 1: Funnel analysis (awareness → trial → adoption). Step 2: Qualitative research on drop-off points. Step 3: Quick wins (onboarding tooltip, default opt-in). Step 4: Reassess positioning." },
  { id: "q-g-p8", question: "How do you balance user experience with revenue goals?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "They're not always in conflict. Gave example of improving ad relevance — better UX AND higher CTR. When they conflict, use long-term LTV analysis to guide decisions." },
  { id: "q-g-p9", question: "Design a product for Google to enter the mental health space.", category: "case", difficulty: 5, wasAsked: true, answeredWell: true, myAnswer: "Proposed 'Google Wellbeing' — mood journaling + AI insights integrated with Fitbit data. Privacy-first architecture. Phased rollout starting with meditation timer." },
  { id: "q-g-p10", question: "How would you evaluate whether to sunset a Google product?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Framework: active users trend, maintenance cost, strategic value, migration path for users. Referenced Google Reader sunset as a case study of what not to do." },
];

const tiktokHRQuestions = [
  { id: "q-t-hr1", question: "Why TikTok? What excites you about short-form video?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Discussed how TikTok's recommendation engine is reshaping content discovery, and my experience with engagement-driven product loops." },
  { id: "q-t-hr2", question: "How do you stay current with social media trends?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Active user of TikTok, Instagram Reels, YouTube Shorts. Track creator economy newsletters. Analyze trending formats weekly for product inspiration." },
  { id: "q-t-hr3", question: "Describe your ideal team culture.", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Fast-paced, data-driven, low hierarchy. Value psychological safety for bold ideas. Weekly ship cycles with retrospectives." },
  { id: "q-t-hr4", question: "Tell me about a time you failed and what you learned.", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Launched a feature without proper A/B testing, saw 15% engagement drop. Learned to always have a rollback plan and statistical significance before full rollout." },
  { id: "q-t-hr5", question: "How do you handle working across time zones?", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Async-first communication, detailed written specs, recorded Loom videos for context. Overlap hours for critical decisions only." },
  { id: "q-t-hr6", question: "What's your understanding of TikTok's competitive landscape?", category: "motivation", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Mapped competitors: YouTube Shorts (scale), Instagram Reels (social graph), Snapchat Spotlight (AR). TikTok's edge: algorithm-first discovery, creator tools ecosystem." },
  { id: "q-t-hr7", question: "How do you prioritize when everything feels urgent?", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Eisenhower matrix adapted for PM: urgent+important (do now), important+not urgent (schedule), urgent+not important (delegate), neither (drop). Review weekly." },
  { id: "q-t-hr8", question: "Tell me about a metric you improved significantly.", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Improved user activation rate by 25% through onboarding redesign. Identified drop-off at step 3, simplified to 2 steps, added progress indicator." },
  { id: "q-t-hr9", question: "What questions do you have for me about the role?", category: "motivation", difficulty: 1, wasAsked: true, answeredWell: true, myAnswer: "Asked about team roadmap for next quarter, how success is measured for this role, and what the biggest challenge the team faces currently." },
  { id: "q-t-hr10", question: "How do you approach building products for a global audience?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Localization beyond translation: cultural context, content moderation nuances, payment methods, network conditions. Referenced experience building for SEA markets." },
];

const tiktokProductQuestions = [
  { id: "q-t-pd1", question: "Design a feature to help creators monetize on TikTok.", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed a tiered 'Creator Marketplace' connecting brands with creators based on niche audience match. Included revenue model and success metrics." },
  { id: "q-t-pd2", question: "How would you improve TikTok's content moderation at scale?", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Multi-layer approach: AI pre-screening (95% coverage), human review for edge cases, community reporting with reputation scoring, transparent appeal process." },
  { id: "q-t-pd3", question: "Design a feature to increase creator retention on the platform.", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed 'Creator Insights Pro' — advanced analytics dashboard showing audience growth drivers, optimal posting times, content gap analysis, and peer benchmarking." },
  { id: "q-t-pd4", question: "How would you measure the health of TikTok's creator ecosystem?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Metrics pyramid: L1 (total active creators), L2 (creator monetization rate, avg revenue), L3 (time to first 1K followers, creator churn rate by cohort)." },
  { id: "q-t-pd5", question: "A competitor just launched a feature similar to what you're building. What do you do?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Don't panic. Analyze: is their implementation better? What can we learn? Double down on our unique advantages (algorithm, user base). Accelerate timeline if strategically important." },
  { id: "q-t-pd6", question: "Design a shopping experience within TikTok videos.", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed 'Shop the Look' — AI-detected products in videos with floating tags, one-tap purchase, creator commission tracking. Referenced Instagram Shopping as benchmark." },
  { id: "q-t-pd7", question: "How would you reduce time-to-first-video for new creators?", category: "case", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Analyzed onboarding funnel. Proposed: template-first creation flow, AI-suggested music/effects, 'duet with trending' prompt, and simplified editing with auto-captions." },
  { id: "q-t-pd8", question: "What's your framework for making trade-offs between growth and safety?", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Safety is non-negotiable baseline, not a trade-off. Growth tactics must pass safety review. Implemented a 'safety impact assessment' checklist for every feature launch." },
  { id: "q-t-pd9", question: "Design a feature for TikTok to expand into education content.", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed 'TikTok Learn' — curated learning paths from educational creators, progress tracking, quiz-style engagement, and partnerships with universities for verified content." },
  { id: "q-t-pd10", question: "How would you handle a viral misinformation crisis on the platform?", category: "product", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Outlined rapid response: AI flagging, fact-checker network, reduced distribution, user warnings. But struggled with the free speech vs. safety tension in the discussion." },
];

const tiktokHMQuestions = [
  { id: "q-t-hm1", question: "How do you handle disagreements with engineering leads?", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Shared a real story about navigating a technical feasibility disagreement, building trust through data and prototyping." },
  { id: "q-t-hm2", question: "Walk me through how you'd run your first 90 days in this role.", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "30 days: learn (user research, team dynamics, codebase). 60 days: identify quick wins and ship one. 90 days: propose Q2 roadmap with data-backed priorities." },
  { id: "q-t-hm3", question: "Tell me about a time you had to make a decision with incomplete data.", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Had to decide on market expansion with limited user data. Used proxy metrics from similar markets, ran a small pilot, and set clear kill criteria." },
  { id: "q-t-hm4", question: "How do you build relationships with cross-functional partners?", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Regular 1:1s, understand their goals and constraints, give credit publicly, involve them early in planning. Specific example of winning over a skeptical design lead." },
  { id: "q-t-hm5", question: "What's your product philosophy?", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "User-obsessed but business-aware. Ship fast, learn faster. Data informs but doesn't dictate — great products need taste and intuition too." },
  { id: "q-t-hm6", question: "How do you give and receive feedback?", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "SBI framework (Situation, Behavior, Impact) for giving. For receiving: assume positive intent, ask for specific examples, follow up with actions." },
  { id: "q-t-hm7", question: "Describe a product you're proud of and why.", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Built a self-serve reporting tool that reduced support tickets by 40%. Proud because it solved a real pain point and the team shipped it in 6 weeks." },
  { id: "q-t-hm8", question: "How do you think about platform vs. feature-level product work?", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Platform work is leverage — invest when multiple teams need similar capabilities. Feature work is impact — invest when user value is clear. Balance with a 70/30 split." },
  { id: "q-t-hm9", question: "What concerns do you have about this role?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Honestly discussed work-life balance concerns at ByteDance. Asked about team norms, on-call expectations, and how the team protects focus time." },
  { id: "q-t-hm10", question: "If you could change one thing about TikTok's product, what would it be?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Improve content diversity in the For You Page. Current algorithm optimizes for engagement, which can create filter bubbles. Proposed a 'discovery dial' for user control." },
];

const stripeRecruiterQuestions = [
  { id: "q-s-r1", question: "What's your understanding of Stripe's business model?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Explained payments infrastructure, developer-first approach, and expansion into financial services (Treasury, Atlas, Radar)." },
  { id: "q-s-r2", question: "Why fintech? What draws you to financial infrastructure?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Fascinated by how money moves digitally. Stripe democratizes access to financial tools. Want to build products that help businesses scale globally." },
  { id: "q-s-r3", question: "Tell me about a technical concept you recently learned.", category: "experience", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Learned about payment tokenization and PCI compliance. Explained how tokenization reduces fraud risk while simplifying merchant integration." },
  { id: "q-s-r4", question: "How do you approach learning a new domain quickly?", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Three-step approach: read foundational docs, talk to domain experts (5-7 interviews), build a small project. Applied this when entering e-commerce from enterprise SaaS." },
  { id: "q-s-r5", question: "Describe a time you simplified a complex process.", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Simplified a 12-step enterprise onboarding to 5 steps by identifying redundant verification steps and automating data pre-fill. Reduced onboarding time by 60%." },
  { id: "q-s-r6", question: "What's a product you admire for its developer experience?", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Stripe itself — documentation is a product. Also Vercel: zero-config deployment, instant previews, and excellent error messages. DX is about reducing time-to-hello-world." },
  { id: "q-s-r7", question: "How do you balance speed and quality in product development?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Quality bar depends on blast radius. Internal tools: move fast. Payment processing: zero tolerance. Use feature flags to decouple deployment from release." },
  { id: "q-s-r8", question: "Tell me about a cross-functional project you led.", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Led a payments integration project with eng, design, legal, and compliance. Weekly syncs, shared Notion workspace, clear RACI matrix. Shipped on time." },
  { id: "q-s-r9", question: "What's your superpower as a PM?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Translating ambiguous user problems into clear engineering requirements. I bridge the gap between 'users are unhappy' and 'here's exactly what to build and why.'" },
  { id: "q-s-r10", question: "Where do you see the payments industry heading in 5 years?", category: "motivation", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Embedded finance everywhere, real-time cross-border payments, crypto as rails (not currency), and AI-driven fraud detection becoming table stakes." },
];

const stripeProductExQuestions = [
  { id: "q-s-pe1", question: "Take-home: Design an onboarding flow for Stripe Atlas international users.", category: "case", difficulty: 5, wasAsked: true, answeredWell: false, myAnswer: "Submitted a 6-page doc with wireframes. Felt the regulatory compliance section was weak — didn't research enough on international banking requirements." },
  { id: "q-s-pe2", question: "How did you decide on the user segments for your Atlas redesign?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Segmented by: solo founders, small teams (<5), and agencies. Each has different incorporation needs, banking requirements, and compliance knowledge levels." },
  { id: "q-s-pe3", question: "Walk through your wireframe decisions.", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Progressive disclosure: show only relevant fields per step. Smart defaults based on country selection. Real-time validation to prevent errors at submission." },
  { id: "q-s-pe4", question: "How would you measure onboarding success for Atlas?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Primary: time-to-incorporation, completion rate. Secondary: support ticket rate during onboarding, NPS at day 7. Guardrail: application rejection rate." },
  { id: "q-s-pe5", question: "What regulatory challenges did you consider?", category: "technical", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Mentioned KYC/AML requirements but lacked specifics on country-by-country variations. Didn't address EIN vs. local tax ID complexities." },
  { id: "q-s-pe6", question: "How would you handle the edge case of a user from a sanctioned country?", category: "technical", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Proposed geo-blocking with a clear error message, but didn't consider VPN detection or the legal nuances of partial sanctions." },
  { id: "q-s-pe7", question: "Critique your own submission — what would you change?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Would add: interactive fee calculator, document upload preview, and a 'preparation checklist' before starting. Also would test with real international founders." },
  { id: "q-s-pe8", question: "How does your onboarding compare to competitors like Firstbase?", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Firstbase is more hand-holdy (concierge model), Atlas is self-serve. My design bridges the gap: self-serve flow with optional expert consultation at key decision points." },
  { id: "q-s-pe9", question: "How would you A/B test different onboarding flows?", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Split by new sign-ups, measure completion rate and time-to-first-payment. Need sufficient sample size given Atlas's lower volume — might need 4-6 weeks per test." },
  { id: "q-s-pe10", question: "What's the most important thing you learned from this exercise?", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Domain expertise matters. I can design good flows, but without deep regulatory knowledge, the details suffer. For fintech PM roles, I need to invest in compliance understanding." },
];

const stripeFinalQuestions = [
  { id: "q-s-fp1", question: "Live product critique: Analyze Stripe's current pricing page.", category: "case", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Identified strengths (transparency, comparison table) but froze when asked about psychological pricing tactics. Needed more preparation on pricing strategy." },
  { id: "q-s-fp2", question: "How would you redesign Stripe's documentation search?", category: "case", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Proposed AI-powered code-aware search, but struggled to articulate the ranking algorithm when pressed for technical details." },
  { id: "q-s-fp3", question: "Estimate the market size for Stripe Treasury.", category: "case", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Top-down: total SMB banking market × digital-first segment × Stripe's addressable share. Got the framework right but my numbers were off by an order of magnitude." },
  { id: "q-s-fp4", question: "You have 5 engineers for 3 months. What do you build for Stripe Radar?", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "Proposed: ML model customization UI for merchants, real-time fraud dashboard with alerting, and integration with Stripe Identity for high-risk transactions." },
  { id: "q-s-fp5", question: "How do you handle a situation where your product accidentally blocks legitimate transactions?", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Immediate: roll back or widen rules. Short-term: root cause analysis, affected merchant communication. Long-term: better testing, shadow mode for rule changes." },
  { id: "q-s-fp6", question: "What's the hardest feedback you've ever received?", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Was told I over-index on consensus-building, which slowed decisions. Changed approach: timebox alignment, then decide and commit. Resulted in faster shipping." },
  { id: "q-s-fp7", question: "Design a developer dashboard for Stripe API usage analytics.", category: "case", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "Good high-level design (request volume, error rates, latency percentiles) but struggled with the real-time data architecture discussion." },
  { id: "q-s-fp8", question: "How would you improve Stripe's checkout conversion rate?", category: "case", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "Analyzed current flow. Proposed: smart payment method ordering by geo, address auto-fill, saved payment methods, and one-click checkout for returning users." },
  { id: "q-s-fp9", question: "Rapid fire: What's more important — reducing fraud or reducing false positives?", category: "product", difficulty: 3, wasAsked: true, answeredWell: false, myAnswer: "Got flustered by the rapid-fire format. The right answer depends on the merchant's risk tolerance, but I gave a generic 'balance both' answer instead." },
  { id: "q-s-fp10", question: "Final question: What would make you turn down an offer from Stripe?", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Honest answer: if the team/role didn't match my growth goals, or if the culture didn't support experimentation. Showed I'm thoughtful about fit, not desperate." },
];

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
      { id: "demo-g1", name: "Applied", status: "completed", result: "passed", date: d(28) },
      {
        id: "demo-g2", name: "HR Screen", status: "completed", result: "passed",
        scheduledTime: d(21), interviewer: "Sarah Chen, Recruiter", feedbackScore: 4,
        questions: googleHRQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Strong rapport with recruiter", "Clear articulation of PM philosophy"],
          whatCouldImprove: ["Could have asked more about team culture"],
          keyTakeaways: ["Google values structured thinking", "They're hiring for a new AI-powered search feature"],
        },
      },
      {
        id: "demo-g3", name: "Technical Round", status: "completed", result: "passed",
        scheduledTime: d(14), interviewer: "Mike Zhang, Senior Engineer", feedbackScore: 4,
        questions: googleTechQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Strong system design thinking", "Good metric framework"],
          whatCouldImprove: ["Should have drawn more diagrams", "Rushed the edge cases section"],
          keyTakeaways: ["Technical bar is high but fair", "They value clarity over completeness"],
        },
      },
      {
        id: "demo-g4", name: "Product Sense", status: "completed", result: "passed",
        scheduledTime: d(7), interviewer: "Lisa Wang, Group PM", feedbackScore: 5,
        questions: googleProductQuestions,
        reflection: {
          overallFeeling: "great",
          whatWentWell: ["Strong user empathy", "Creative solution with offline-first approach", "Interviewer was visibly impressed"],
          whatCouldImprove: ["Could quantify TAM better"],
          keyTakeaways: ["Product sense round is the differentiator", "Lisa mentioned team is growing fast — good sign"],
        },
      },
      {
        id: "demo-g5", name: "Cross-functional Round", status: "scheduled",
        scheduledTime: future(3), interviewer: "David Park, Director of Engineering",
      },
      { id: "demo-g6", name: "Offer Discussion", status: "pending" },
    ];

    const googleJob = {
      user_id: userId, company_name: "Google", role_title: "Senior Product Manager",
      location: "US", status: "interviewing", source: "referral", interest_level: 5,
      career_fit_notes: "Dream role — AI-powered search product. Strong referral from college friend on the team. TC range $280-350K. Team is 15 engineers, 2 designers.",
      created_at: d(28), updated_at: d(1),
      stages: {
        list: googleStages,
        _metadata: {
          pipelines: [{ id: "demo-pipe-g1", type: "primary", status: "active", targetRole: "Senior Product Manager", stages: googleStages, createdAt: d(28) }],
          subStatus: "interview_scheduled",
          riskTags: ["competing_offer"],
        },
      },
    };

    // ========== Job 2: TikTok - PM (offer) ==========
    const tiktokStages = [
      { id: "demo-t1", name: "Applied", status: "completed", result: "passed", date: d(35) },
      {
        id: "demo-t2", name: "HR Screen", status: "completed", result: "passed",
        scheduledTime: d(30), interviewer: "Jenny Liu, Talent Partner", feedbackScore: 4,
        questions: tiktokHRQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Showed genuine passion for the product"],
          whatCouldImprove: ["Ask more about work-life balance"],
          keyTakeaways: ["Fast-paced culture, ship weekly"],
        },
      },
      {
        id: "demo-t3", name: "Product Design Round", status: "completed", result: "passed",
        scheduledTime: d(22), interviewer: "Kevin Xu, Staff PM", feedbackScore: 4,
        questions: tiktokProductQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Strong business model thinking", "Good competitive analysis vs YouTube"],
          whatCouldImprove: ["More focus on creator experience"],
          keyTakeaways: ["TikTok PM culture is very metrics-driven"],
        },
      },
      {
        id: "demo-t4", name: "Hiring Manager Round", status: "completed", result: "passed",
        scheduledTime: d(15), interviewer: "Amy Zhang, Director of Product", feedbackScore: 5,
        questions: tiktokHMQuestions,
        reflection: {
          overallFeeling: "great",
          whatWentWell: ["Amazing chemistry with hiring manager", "She shared team roadmap — strong buy signal"],
          whatCouldImprove: [],
          keyTakeaways: ["Team owns TikTok Shop creator tools", "Headcount is growing, urgent to fill"],
        },
      },
      {
        id: "demo-t5", name: "Offer Discussion", status: "completed", result: "passed",
        scheduledTime: d(5), interviewer: "Jenny Liu, Talent Partner", feedbackScore: 5,
        reflection: {
          overallFeeling: "great",
          whatWentWell: ["Offer is competitive", "Signing bonus included"],
          whatCouldImprove: [],
          keyTakeaways: ["Base: $185K, RSU: $200K/4yr, Sign-on: $30K", "Need to respond within 2 weeks", "Can try negotiating RSU with competing Google offer"],
        },
      },
    ];

    const tiktokJob = {
      user_id: userId, company_name: "TikTok", role_title: "Product Manager",
      location: "US", status: "offer", source: "linkedin", interest_level: 4,
      career_fit_notes: "Offer received! Strong team, fast growth. Concern: work-life balance and ByteDance culture. Deadline to respond: 2 weeks.",
      created_at: d(35), updated_at: d(1),
      stages: {
        list: tiktokStages,
        _metadata: {
          pipelines: [{ id: "demo-pipe-t1", type: "primary", status: "completed", targetRole: "Product Manager", stages: tiktokStages, createdAt: d(35) }],
          subStatus: "offer_received",
        },
      },
    };

    // ========== Job 3: Stripe - APM (closed, rejected) ==========
    const stripeStages = [
      { id: "demo-s1", name: "Applied", status: "completed", result: "passed", date: d(42) },
      {
        id: "demo-s2", name: "Recruiter Call", status: "completed", result: "passed",
        scheduledTime: d(38), interviewer: "Tom Baker, University Recruiter", feedbackScore: 4,
        questions: stripeRecruiterQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["Strong knowledge of fintech ecosystem"],
          whatCouldImprove: ["Should have asked about APM program structure"],
          keyTakeaways: ["APM program is very competitive, ~5% acceptance"],
        },
      },
      {
        id: "demo-s3", name: "Product Exercise", status: "completed", result: "passed",
        scheduledTime: d(30), interviewer: "Rachel Kim, PM", feedbackScore: 3,
        questions: stripeProductExQuestions,
        reflection: {
          overallFeeling: "neutral",
          whatWentWell: ["Good wireframes", "Strong user research section"],
          whatCouldImprove: ["Regulatory knowledge gap was obvious", "Should have spent more time on edge cases"],
          keyTakeaways: ["Stripe cares deeply about precision and edge cases", "APM bar is extremely high for product craft"],
        },
      },
      {
        id: "demo-s4", name: "Final Panel", status: "completed", result: "rejected",
        scheduledTime: d(22), interviewer: "Panel: 3 PMs + 1 Engineer", feedbackScore: 2,
        questions: stripeFinalQuestions,
        reflection: {
          overallFeeling: "poor",
          whatWentWell: ["Good rapport with individual interviewers"],
          whatCouldImprove: ["Struggled with the rapid-fire product critique exercise", "Need to practice live product teardowns", "Got nervous during the metrics deep-dive"],
          keyTakeaways: ["Panel format is intense — need more mock practice", "Stripe expects near-perfect analytical rigor", "Still valuable: learned my weak spots in fintech PM skills"],
        },
      },
    ];

    const stripeJob = {
      user_id: userId, company_name: "Stripe", role_title: "Associate Product Manager",
      location: "US", status: "closed", source: "website", interest_level: 4,
      career_fit_notes: "Rejected after final panel. Key learning: need stronger analytical rigor for fintech roles. The take-home exercise feedback was constructive — keep the wireframes for portfolio. Completed 3 of 4 stages.",
      created_at: d(42), updated_at: d(20),
      stages: {
        list: stripeStages,
        _metadata: {
          pipelines: [{ id: "demo-pipe-s1", type: "primary", status: "closed", targetRole: "Associate Product Manager", stages: stripeStages, createdAt: d(42), closedAt: d(20), closedReason: "rejected_after_interview" }],
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

    const jobMap: Record<string, string> = {};
    for (const j of insertedJobs || []) {
      jobMap[j.company_name] = j.id;
    }

    const activities = [
      { user_id: userId, job_id: jobMap["Stripe"], type: "application", message: "Applied to Stripe — Associate Product Manager", created_at: d(42) },
      { user_id: userId, job_id: jobMap["TikTok"], type: "application", message: "Applied to TikTok — Product Manager", created_at: d(35) },
      { user_id: userId, job_id: jobMap["Google"], type: "application", message: "Applied to Google — Senior Product Manager", created_at: d(28) },
      { user_id: userId, job_id: jobMap["Stripe"], type: "stage_update", message: "Rejected after Final Panel at Stripe", created_at: d(22) },
      { user_id: userId, job_id: jobMap["Google"], type: "stage_update", message: "Product Sense round completed at Google — passed!", created_at: d(7) },
      { user_id: userId, job_id: jobMap["TikTok"], type: "offer", message: "🎉 Received offer from TikTok — Product Manager", created_at: d(5) },
      { user_id: userId, job_id: jobMap["Google"], type: "stage_update", message: "Cross-functional round scheduled at Google", created_at: d(1) },
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
