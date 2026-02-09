

# Automatic Demo Workspace for New Users

## Goal
When a new user registers, automatically seed their account with 3 realistic job applications (Google PM, TikTok PM, Stripe APM) complete with interview rounds, AI analysis data, notes, and an Offer Decision example. This creates the "Aha Moment" within 30 seconds of signup.

## Demo Data Design

### Job 1: Google - Senior PM (Status: `interviewing`, deep pipeline)
- 4 completed rounds (HR Screen, Technical, Product Sense, Cross-functional)
- Each round has questions, reflections, feedback scores
- Risk tags: `competing_offer`
- Sub-status: `interview_scheduled` (final round upcoming)
- Shows the full interview tracking + timeline experience

### Job 2: TikTok - PM (Status: `offer`, the "Aha Moment")
- 3 completed rounds + Offer Discussion completed
- Sub-status: `offer_received`
- Salary details in career fit notes
- Shows the offer decision scenario -- users immediately see career intelligence value

### Job 3: Stripe - APM (Status: `closed`, rejected after Round 2)
- 2 completed rounds, rejected at Round 3
- Closed reason: `rejected_after_interview`
- Shows how the system reframes failures as progress ("Completed 2/4 stages")
- Pipeline with terminal state for resolver demo

## Technical Implementation

### 1. Database: Add `demo_seeded` flag
- Add a `demo_seeded boolean DEFAULT false` column to a new `user_profiles` table (or use metadata approach)
- Alternative (simpler): Use an edge function that checks if user has any jobs; if zero jobs exist, seed data. This avoids needing a new table.

### 2. Edge Function: `seed-demo-data`
- Accepts authenticated user request
- Checks if user already has jobs (idempotent -- won't re-seed)
- Inserts 3 demo jobs with rich pipeline/stage data directly into the `jobs` table
- Also inserts corresponding `recent_activities` entries for a realistic activity feed
- Returns success/already-seeded status

### 3. Frontend: Trigger on first login
- In `JobsProvider`, after fetching jobs: if user exists AND jobs array is empty AND not already loading, call the seed edge function
- After seeding, refetch jobs
- Show a brief welcome toast: "We've set up a sample workspace for you!"

### 4. Data Details (per job)
Each demo job will include:
- `company_name`, `role_title`, `location`, `status`, `source`, `interest_level`
- `stages` JSONB with full `InterviewStage[]` including:
  - `name`, `status`, `result`, `scheduledTime`, `interviewer`, `feedbackScore`
  - `questions[]` with category, difficulty, answers
  - `reflection` with feelings, strengths, improvements
- `_metadata` with `pipelines`, `subStatus`, `riskTags`, `closedReason` as appropriate

### 5. Activity Feed Entries
Seed 5-8 `recent_activities` rows tied to the demo jobs:
- "Applied to Google - Senior PM"
- "HR Screen completed at TikTok"
- "Received offer from TikTok - PM"
- "Rejected after Round 2 at Stripe"

## Flow

```text
User signs up / first login
        |
        v
JobsProvider fetches jobs -> empty array
        |
        v
Call POST /seed-demo-data (with auth token)
        |
        v
Edge function checks: user has 0 jobs?
   Yes -> Insert 3 jobs + activities -> return { seeded: true }
   No  -> return { seeded: false, reason: "already_has_data" }
        |
        v
Frontend refetches jobs + shows welcome toast
        |
        v
User sees populated Dashboard with stats, upcoming interviews, activity feed
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/seed-demo-data/index.ts` | Create -- edge function with demo data |
| `src/contexts/JobsContext.tsx` | Modify -- add auto-seed logic after empty fetch |
| `src/lib/demo-data.ts` | Create -- demo job data factory (keeps edge function clean) |

## Edge Cases
- Idempotent: only seeds if user has exactly 0 jobs
- User deletes all demo data: will NOT re-seed (we track via a simple flag in the edge function response stored in localStorage)
- Google OAuth and email signup both trigger the same flow
- No impact on existing users who already have data

