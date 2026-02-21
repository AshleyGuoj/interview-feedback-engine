import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEMO_ACCOUNTS = [
  { email: "demo@offermind.app", password: "demo123456" },
  { email: "demo-cn@offermind.app", password: "demo123456cn" },
];

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

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const results: { email: string; status: string }[] = [];

    for (const account of DEMO_ACCOUNTS) {
      const exists = existingUsers?.users?.find(u => u.email === account.email);
      if (exists) {
        results.push({ email: account.email, status: "already_exists" });
        continue;
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      });

      if (error) {
        results.push({ email: account.email, status: `error: ${error.message}` });
      } else {
        results.push({ email: account.email, status: "created" });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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
