
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a real-time subscription to class changes
 * @param callback Function to call when class data changes
 * @param teacherId Optional teacher ID to filter changes by
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToClassChanges = (
  callback: () => void,
  teacherId?: string
) => {
  // Set up channel for real-time updates
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'classes'
      },
      (payload) => {
        console.log('Class change detected:', payload);
        // Call the callback to refresh data
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Creates a real-time subscription to student changes
 * @param callback Function to call when student data changes
 * @param classId Optional class ID to filter changes by
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToStudentChanges = (
  callback: () => void,
  classId?: string
) => {
  // Set up channel for real-time updates
  const channel = supabase
    .channel('student-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'students'
      },
      (payload) => {
        console.log('Student change detected:', payload);
        // Call the callback to refresh data
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Creates a real-time subscription to school changes
 * @param callback Function to call when school data changes
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToSchoolChanges = (
  callback: () => void
) => {
  // Set up channel for real-time updates
  const channel = supabase
    .channel('school-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'schools'
      },
      (payload) => {
        console.log('School change detected:', payload);
        // Call the callback to refresh data
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Enable realtime functionality on tables
 * Call this function once at app initialization
 */
export const enableRealtimeForTables = async () => {
  try {
    // Define an explicit type for the tables array
    const tables = ['students', 'classes', 'schools', 'teachers'] as const;
    
    type TableName = typeof tables[number];
    
    // Now we're passing a correctly typed parameter to the RPC call
    const { error } = await supabase.rpc('enable_realtime', {
      table_names: tables
    });
    
    if (error) {
      console.error('Error enabling realtime for tables:', error);
    } else {
      console.log('Realtime enabled for tables');
    }
  } catch (err) {
    console.error('Failed to enable realtime:', err);
  }
};
