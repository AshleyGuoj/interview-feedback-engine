import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function detectCategory(name: string): string {
  const n = name.toLowerCase().trim();
  if (/offer\s*(received|沟通|call)/i.test(n) || n === 'offer received' || n === '收到offer') return 'offer_received';
  if (/offer/i.test(n)) return 'offer_call';
  if (/hr\s*(screen|chat|沟通|谈薪|面)/i.test(n) || n.includes('recruiter') || n.includes('phone screen')) return 'hr_chat';
  if (/笔试|written\s*test|coding\s*test|take[\s-]*home/i.test(n)) return 'written_test';
  if (/测评|assessment|oa|online\s*assessment/i.test(n)) return 'assessment';
  if (/简历|resume|cv\s*screen/i.test(n)) return 'resume_screen';
  if (/投递|appli(ed|cation)|submit/i.test(n)) return 'application';
  if (/interview|面试|technical|behavio|system\s*design|onsite|final\s*round|loop/i.test(n)) return 'interview';
  return 'interview'; // default
}

function deriveStatus(stages: any[], currentStatus: string): string {
  if (currentStatus === 'closed') return 'closed';

  const hasOfferCompleted = stages.some(
    (s: any) => s.status === 'completed' && (s.name || '').toLowerCase().includes('offer')
  );
  if (hasOfferCompleted) return 'offer';

  const interviewActive = ['scheduled', 'rescheduled', 'completed', 'feedback_pending'];
  const hasRealInterview = stages.some(
    (s: any) => s.category === 'interview' && interviewActive.includes(s.status)
  );
  if (hasRealInterview) return 'interviewing';

  return 'applied';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: jobs, error } = await supabase.from('jobs').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }

  let updated = 0;
  for (const job of jobs || []) {
    const stagesData = job.stages || [];
    let stages: any[] = [];
    let metadata: any = {};

    if (Array.isArray(stagesData)) {
      stages = stagesData;
    } else {
      stages = stagesData.list || [];
      metadata = stagesData._metadata || {};
    }

    // Ensure categories
    let categoriesChanged = false;
    for (const stage of stages) {
      if (!stage.category) {
        stage.category = detectCategory(stage.name || '');
        categoriesChanged = true;
      }
    }

    const newStatus = deriveStatus(stages, job.status);
    const statusChanged = newStatus !== job.status;

    if (categoriesChanged || statusChanged) {
      const newStagesJson = Array.isArray(stagesData)
        ? stages
        : { list: stages, _metadata: metadata };

      await supabase.from('jobs').update({
        stages: newStagesJson,
        status: newStatus,
      }).eq('id', job.id);
      updated++;
    }
  }

  return new Response(JSON.stringify({ updated, total: jobs?.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
