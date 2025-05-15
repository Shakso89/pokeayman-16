
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
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { username, email, password, avatarUrl } = body;
    console.log("Request received for:", email, "username:", username);

    // Input validation
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create a Supabase client with the Auth admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ 
        error: "Server configuration error: Missing Supabase credentials" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    console.log(`Creating teacher with email: ${email}, username: ${username}`);
    
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
      console.error("Error creating teacher:", createUserError);
      return new Response(JSON.stringify({ error: createUserError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Teacher auth user created successfully:", user);
    
    // Create a corresponding record in the teachers table
    if (user?.user) {
      try {
        const { data: teacherData, error: teacherInsertError } = await supabaseAdmin
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
          })
          .select()
          .single();
        
        if (teacherInsertError) {
          console.error("Error creating teacher record:", teacherInsertError);
          // We don't want to roll back the auth user creation
          return new Response(JSON.stringify({ 
            user: user,
            warning: "Teacher account created but database record failed. Please try logging in."
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Still return 200 since the auth user was created
          });
        } else {
          console.log("Teacher record created successfully in teachers table:", teacherData);
          
          // Initialize teacher credits
          const { data: creditsData, error: creditsError } = await supabaseAdmin
            .from('teacher_credits')
            .insert({
              teacher_id: user.user.id,
              credits: 10, // Starting credits
              used_credits: 0
            })
            .select()
            .single();
            
          if (creditsError) {
            console.error("Error initializing teacher credits:", creditsError);
            return new Response(JSON.stringify({ 
              user: user,
              teacher: teacherData,
              warning: "Teacher credits could not be initialized."
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200, // Still return 200 since the teacher was created
            });
          } else {
            console.log("Teacher credits initialized successfully:", creditsData);
          }
        }
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        return new Response(JSON.stringify({ 
          user: user,
          error: "Database error, but auth account was created."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    // Return the created user
    return new Response(JSON.stringify({ 
      success: true,
      user 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
