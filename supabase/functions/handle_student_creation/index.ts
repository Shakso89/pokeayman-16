
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { username, email, password, avatarUrl } = await req.json();

    // Input validation
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create a Supabase client with the Auth admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    console.log(`Creating user with email: ${email}, username: ${username}`);
    
    // Create user with the Admin API
    const { data: user, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        username: username || email.split('@')[0],
        avatar_url: avatarUrl || '',
        user_type: "teacher",
      }
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      return new Response(JSON.stringify({ error: createUserError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("User created successfully:", user);
    
    // Create a corresponding record in the teachers table
    if (user?.user) {
      const { error: teacherInsertError } = await supabaseAdmin
        .from('teachers')
        .insert({
          id: user.user.id,
          username: username || email.split('@')[0],
          email: email,
          display_name: username || email.split('@')[0],
          password: '***', // We don't store the actual password in this table
          created_at: new Date().toISOString(),
          is_active: true,
          subscription_type: 'trial'
        });
      
      if (teacherInsertError) {
        console.error("Error creating teacher record:", teacherInsertError);
        // We don't want to fail the whole operation just because of this
        // The user was still created in auth.users
      } else {
        console.log("Teacher record created successfully in teachers table");
        
        // Initialize teacher credits
        const { error: creditsError } = await supabaseAdmin
          .from('teacher_credits')
          .insert({
            teacher_id: user.user.id,
            credits: 10, // Starting credits
            used_credits: 0
          });
          
        if (creditsError) {
          console.error("Error initializing teacher credits:", creditsError);
        } else {
          console.log("Teacher credits initialized successfully");
        }
      }
    }
    
    // Return the created user
    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
