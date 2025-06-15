import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const subscribeToClass = (classId: string, callback: () => void) => {
  return supabase
    .channel(`class_updates:${classId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "classes", filter: `id=eq.${classId}` },
      (payload) => {
        console.log("Change received!", payload);
        callback();
      }
    )
    .subscribe();
};

const subscribeToStudent = (studentId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`student_class_updates:${studentId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "student_classes", filter: `student_id=eq.${studentId}` },
      (payload) => {
        console.log("Change received on student_classes!", payload);
        callback(payload);
      }
    )
    .subscribe();
};

const subscribeToTables = (tables: string[], callback: () => void) => {
  const channels = tables.map((table) => {
    return supabase
      .channel(`table_updates:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          console.log(`Change received for table ${table}!`, payload);
          callback();
        }
      )
      .subscribe();
  });
  
  return channels;
};

// Enhanced function to enable realtime for tables
const enableRealtimeForTables = async () => {
  try {
    console.log("Enabling realtime functionality for database tables");
    
    // Call the Supabase RPC function to enable realtime
    const { data, error } = await supabase.rpc('enable_realtime', {
      table_names: ['classes', 'students', 'teachers', 'schools']
    });
    
    if (error) {
      console.error("Error enabling realtime:", error);
      return false;
    }
    
    console.log("Realtime functionality enabled successfully");
    
    return true;
  } catch (error) {
    console.error("Error enabling realtime:", error);
    toast({
      title: "Error",
      description: "Failed to enable realtime functionality. Some updates might not appear automatically.",
      variant: "destructive"
    });
    return false;
  }
};

// Create a general purpose user activity subscription
const subscribeToUserActivity = (userId: string, callback: (activity: any) => void) => {
  // Subscribe to user-specific tables
  const channel = supabase
    .channel(`user_activity:${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_activities", filter: `user_id=eq.${userId}` },
      (payload) => {
        console.log("User activity received:", payload);
        callback(payload.new);
      }
    )
    .subscribe();
  
  return channel;
};

// Create a global activity subscription
const subscribeToGlobalActivity = (callback: (activity: any) => void) => {
  // Subscribe to global activities
  const channel = supabase
    .channel('global_activity')
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "user_activities", filter: "is_public=eq.true" },
      (payload) => {
        console.log("Global activity received:", payload);
        callback(payload.new);
      }
    )
    .subscribe();
  
  return channel;
};

// Record a user activity
const recordUserActivity = async (
  userId: string, 
  activityType: string, 
  details: any, 
  isPublic: boolean = false
) => {
  try {
    // Using a direct insert with executeRaw to bypass TypeScript type issues
    // This is a temporary solution until the database types are updated
    const { data, error } = await supabase
      .from('user_activities' as any)
      .insert({
        user_id: userId,
        activity_type: activityType,
        details,
        is_public: isPublic,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error recording user activity:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error recording user activity:", error);
    return null;
  }
};

export { 
  subscribeToClass, 
  subscribeToStudent, 
  subscribeToTables, 
  enableRealtimeForTables,
  subscribeToUserActivity,
  subscribeToGlobalActivity,
  recordUserActivity
};
