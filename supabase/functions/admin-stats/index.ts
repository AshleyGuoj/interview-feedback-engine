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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all users
    const { data: usersData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const users = usersData?.users || [];

    // Fetch job counts per user
    const { data: jobCounts } = await adminClient
      .from("jobs")
      .select("user_id, id");

    // Fetch activity counts per user
    const { data: activities } = await adminClient
      .from("recent_activities")
      .select("user_id, type, created_at")
      .order("created_at", { ascending: false });

    // Aggregate per user
    const jobCountMap: Record<string, number> = {};
    (jobCounts || []).forEach((j: any) => {
      jobCountMap[j.user_id] = (jobCountMap[j.user_id] || 0) + 1;
    });

    const activityMap: Record<string, { count: number; lastAction: string | null; interviewsAnalyzed: number }> = {};
    (activities || []).forEach((a: any) => {
      if (!activityMap[a.user_id]) {
        activityMap[a.user_id] = { count: 0, lastAction: null, interviewsAnalyzed: 0 };
      }
      activityMap[a.user_id].count++;
      if (!activityMap[a.user_id].lastAction) {
        activityMap[a.user_id].lastAction = a.created_at;
      }
      if (a.type === "interview_analyzed") {
        activityMap[a.user_id].interviewsAnalyzed++;
      }
    });

    const enrichedUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
      jobCount: jobCountMap[u.id] || 0,
      activityCount: activityMap[u.id]?.count || 0,
      lastAction: activityMap[u.id]?.lastAction || null,
      interviewsAnalyzed: activityMap[u.id]?.interviewsAnalyzed || 0,
    }));

    // Summary stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const totalUsers = users.length;
    const todayUsers = users.filter((u: any) => u.created_at >= todayStart).length;
    const weekUsers = users.filter((u: any) => u.created_at >= weekAgo).length;
    const activeUsers = users.filter((u: any) => u.last_sign_in_at && u.last_sign_in_at >= weekAgo).length;

    return new Response(
      JSON.stringify({
        summary: { totalUsers, todayUsers, weekUsers, activeUsers },
        users: enrichedUsers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
