
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
