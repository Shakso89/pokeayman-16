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

export { subscribeToClass, subscribeToStudent, subscribeToTables };
