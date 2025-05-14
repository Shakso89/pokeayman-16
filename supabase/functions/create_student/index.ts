
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
    const { username, password, displayName, teacherId } = await req.json();

    if (!username || !password || !displayName || !teacherId) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields. Please provide username, password, displayName, and teacherId" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key
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
    
    console.log(`Creating student account with username: ${username} for teacher: ${teacherId}`);
    
    // First check if username is already in use
    const { data: existingStudents, error: checkError } = await supabaseAdmin
      .from('students')
      .select('username')
      .eq('username', username)
      .limit(1);
      
    if (checkError) {
      console.error("Error checking username:", checkError);
      return new Response(JSON.stringify({ error: `Error checking username: ${checkError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
      
    if (existingStudents && existingStudents.length > 0) {
      return new Response(JSON.stringify({ error: "This username is already in use" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check teacher credits before creating the student
    const { data: creditInfo, error: creditError } = await supabaseAdmin
      .from('teacher_credits')
      .select('credits, used_credits')
      .eq('teacher_id', teacherId)
      .maybeSingle();
    
    if (creditError) {
      console.error("Error checking credits:", creditError);
      return new Response(JSON.stringify({ error: `Error checking credits: ${creditError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // If no credit info exists, create it
    let credits = { credits: 10, used_credits: 0 };
    if (!creditInfo) {
      const { error: insertCreditError } = await supabaseAdmin
        .from('teacher_credits')
        .insert({
          teacher_id: teacherId,
          credits: 10, // Starting with 10 credits
          used_credits: 0
        });
        
      if (insertCreditError) {
        console.error("Error creating teacher credits:", insertCreditError);
        return new Response(JSON.stringify({ error: `Error creating credits: ${insertCreditError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      credits = creditInfo;
    }
    
    if (credits.credits < 2) {
      return new Response(JSON.stringify({ error: "Insufficient credits to create a student account" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Generate a UUID for the student
    const studentId = crypto.randomUUID();

    // Create new student in the database using the service role (bypasses RLS)
    const { data: newStudent, error: insertError } = await supabaseAdmin
      .from('students')
      .insert({
        id: studentId,
        username: username,
        password: password, 
        display_name: displayName,
        teacher_id: teacherId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (insertError) {
      console.error("Error creating student:", insertError);
      return new Response(JSON.stringify({ error: `Failed to create student: ${insertError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Update teacher credits (deduct 2 credits)
    const usedCredits = credits.used_credits || 0;
    const { error: updateError } = await supabaseAdmin
      .from('teacher_credits')
      .update({ 
        credits: credits.credits - 2,
        used_credits: usedCredits + 2
      })
      .eq('teacher_id', teacherId);
    
    if (updateError) {
      console.error("Error updating credits:", updateError);
      // We won't fail the whole operation if credit update fails
      // Just log it for now
    }
    
    // Record the credit transaction
    const { error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        teacher_id: teacherId,
        amount: -2,
        reason: `Create student account: ${displayName}`
      });
    
    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      // Also not failing if transaction recording fails
    }
    
    // Return the created student
    return new Response(JSON.stringify({ 
      success: true,
      student: newStudent
    }), {
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
