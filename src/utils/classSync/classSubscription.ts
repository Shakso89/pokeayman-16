
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Subscribes to changes on student tables for a specific class
 * @param classId The class ID to subscribe to
 * @param onStudentChange Callback function triggered when a student record changes
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToClassChanges = (
  classId: string,
  onStudentChange: (payload: any) => void
) => {
  console.log(`Setting up subscription for class ${classId}`);

  // Define a channel for students in this class
  const channel = supabase
    .channel(`class_${classId}_changes`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "students",
        filter: `class_id=eq.${classId}`, // Only for students in this class
      },
      (payload) => {
        console.log("Student change detected:", payload);
        onStudentChange(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status for class ${classId}:`, status);
      
      if (status === "SUBSCRIBED") {
        toast({
          title: "Class Sync Active",
          description: "You'll receive real-time updates for this class",
        });
      } else if (status === "CHANNEL_ERROR") {
        toast({
          title: "Sync Error",
          description: "Could not establish real-time connection",
          variant: "destructive",
        });
      }
    });

  // Return cleanup function
  return () => {
    console.log(`Cleaning up subscription for class ${classId}`);
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribes to student homework completion events
 * @param teacherId The teacher ID to subscribe to events for
 * @param onHomeworkChange Callback function triggered when a homework record changes
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToHomeworkChanges = (
  teacherId: string,
  onHomeworkChange: (payload: any) => void
) => {
  console.log(`Setting up homework subscription for teacher ${teacherId}`);

  // Define a channel for homework changes
  const channel = supabase
    .channel(`teacher_${teacherId}_homework`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events
        schema: "public",
        table: "homework_submissions",
      },
      (payload) => {
        console.log("Homework submission change detected:", payload);
        onHomeworkChange(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Homework subscription status:`, status);
    });

  // Return cleanup function
  return () => {
    console.log(`Cleaning up homework subscription for teacher ${teacherId}`);
    supabase.removeChannel(channel);
  };
};

/**
 * Enables realtime functionality for database tables
 * This is a one-time operation to make sure tables can be subscribed to
 */
export const enableRealtimeForTables = async () => {
  try {
    // Define which tables should have realtime enabled
    const tables: string[] = [
      'students',
      'classes',
      'schools',
      'teachers',
      'homework',
      'homework_submissions'
    ];
    
    console.log("Enabling realtime for tables:", tables);
    
    // Call the database function to enable realtime
    const { error } = await supabase.rpc('enable_realtime', { table_names: tables });
    
    if (error) {
      console.error("Error enabling realtime:", error);
      return false;
    }
    
    console.log("Realtime enabled successfully for tables");
    return true;
  } catch (err) {
    console.error("Exception enabling realtime:", err);
    return false;
  }
};
