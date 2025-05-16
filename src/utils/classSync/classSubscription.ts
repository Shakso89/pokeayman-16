
import { supabase } from "@/integrations/supabase/client";

const subscribeToClass = (classId: string, callback: () => void) => {
  supabase
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

const subscribeToStudent = (studentId: string, callback: () => void) => {
  supabase
    .channel(`student_updates:${studentId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "students", filter: `id=eq.${studentId}` },
      (payload) => {
        console.log("Change received!", payload);
        callback();
      }
    )
    .subscribe();
};

const subscribeToTables = (tables: string[], callback: () => void) => {
  tables.forEach((table) => {
    supabase
      .channel(`table_updates:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: table },
        (payload) => {
          console.log(`Change received for table ${table}!`, payload);
          callback();
        }
      )
      .subscribe();
  });
};

// Add the missing function
const enableRealtimeForTables = async () => {
  try {
    // Call the Supabase edge function to enable realtime for tables
    // This is a placeholder function - in a real app, you would make an RPC call
    console.log("Enabling realtime for tables");
    
    // Example of how this would work with an actual RPC call:
    // await supabase.rpc('enable_realtime');
    
    return true;
  } catch (error) {
    console.error("Error enabling realtime:", error);
    return false;
  }
};

export { subscribeToClass, subscribeToStudent, subscribeToTables, enableRealtimeForTables };
