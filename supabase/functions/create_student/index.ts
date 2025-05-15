
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
    
    const { username, password, displayName, teacherId } = body;
    console.log(`Request received: username=${username}, displayName=${displayName}, teacherId=${teacherId}`);

    if (!username || !password || !displayName || !teacherId) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields. Please provide username, password, displayName, and teacherId" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key
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
    
    console.log(`Creating student account with username: ${username} for teacher: ${teacherId}`);
    
    // Function to validate UUID format
    const isValidUUID = (uuid: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };
    
    // Validate and ensure teacherId is in proper UUID format
    let validTeacherId = teacherId;
    if (!isValidUUID(teacherId)) {
      console.warn(`TeacherId ${teacherId} is not a valid UUID format`);
      try {
        // Try to generate a valid UUID or use a fallback
        validTeacherId = crypto.randomUUID();
        console.log(`Generated fallback UUID: ${validTeacherId}`);
      } catch (e) {
        console.error("Failed to generate UUID:", e);
        validTeacherId = "00000000-0000-0000-0000-000000000000";
      }
    }
    
    // Check if username is already in use
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

    try {
      // First verify that the teacher exists
      const { data: teacherData, error: teacherError } = await supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('id', validTeacherId)
        .single();
        
      if (teacherError) {
        console.error("Error checking teacher:", teacherError);
        if (teacherError.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: "Teacher not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          });
        }
        return new Response(JSON.stringify({ error: `Error checking teacher: ${teacherError.message}` }), {
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
          teacher_id: validTeacherId,
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

      console.log("Student created successfully:", newStudent);
      
      // Return the created student
      return new Response(JSON.stringify({ 
        success: true,
        student: newStudent
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      console.error("Error in student creation process:", error);
      throw error; // Re-throw to be caught by outer catch
    }
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message || "Unknown error occurred" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
