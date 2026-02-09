import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEMO_EMAIL = "demo@offermind.app";
const DEMO_PASSWORD = "demo123456";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if demo user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const demoUser = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

    if (demoUser) {
      return new Response(
        JSON.stringify({ success: true, message: "Demo user already exists" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create demo user with auto-confirm
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Demo user created", userId: data.user.id }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
