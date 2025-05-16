
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: SubscriptionEvent;
  filter?: string;
  schema?: string;
  onData?: (payload: any) => void;
}

/**
 * A hook for subscribing to realtime changes in Supabase tables
 */
export function useRealtimeSubscription<T = any>({
  table,
  event = '*',
  filter,
  schema = 'public',
  onData
}: UseRealtimeSubscriptionOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Set up the subscription
  useEffect(() => {
    setLoading(true);

    const channelId = `${table}_${event}_${Math.random().toString(36).substring(2, 9)}`;
    const realtimeChannel = supabase.channel(channelId);
    
    const subscription = realtimeChannel
      .on(
        'postgres_changes', // This is the correct event name for Supabase's realtime PostgreSQL changes
        { 
          event, 
          schema, 
          table,
          ...(filter ? { filter } : {}) 
        }, 
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log(`Realtime change on ${table}:`, payload);
          
          // If we have a custom handler, use it
          if (onData) {
            onData(payload);
          } else {
            // Otherwise update the internal state
            setData(payload.new as T);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription to ${table} ${status}`);
        if (status === 'SUBSCRIBED') {
          setLoading(false);
        }
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setError(new Error(`Failed to subscribe to ${table}: ${status}`));
          setLoading(false);
        }
      });
    
    setChannel(realtimeChannel);

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [table, event, filter, schema, onData]);

  return { data, error, loading, channel };
}

/**
 * A hook to subscribe to activity feed updates
 */
export function useActivityFeed(userId?: string, global: boolean = false) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Use any type to bypass TypeScript checking for now
        // This will be properly typed once the database schema is updated
        let query = supabase.from('user_activities' as any).select('*');
        
        if (global) {
          // For global feed, get public activities
          query = query.eq('is_public', true);
        } else if (userId) {
          // For user feed, get activities for that user
          query = query.eq('user_id', userId);
        } else {
          // No user ID and not global, nothing to fetch
          setActivities([]);
          setLoading(false);
          return;
        }
        
        // Order by created_at and limit
        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) {
          throw error;
        }
        
        setActivities(data || []);
      } catch (err: any) {
        console.error('Error fetching activities:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (global || userId) {
      fetchActivities();
    }
  }, [userId, global]);

  // Subscribe to realtime updates
  useRealtimeSubscription({
    table: 'user_activities',
    event: 'INSERT',
    filter: global ? 'is_public=eq.true' : userId ? `user_id=eq.${userId}` : undefined,
    onData: (payload) => {
      // Add new activity to the top of the list
      setActivities(prev => [payload.new, ...prev]);
    }
  });

  return { activities, loading, error };
}

/**
 * Hook to record a new user activity
 */
export function useRecordActivity() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const recordActivity = async (
    userId: string, 
    activityType: string, 
    details: any, 
    isPublic: boolean = false
  ) => {
    try {
      setRecording(true);
      
      // Use any type to bypass TypeScript checking for now
      const { data, error } = await supabase
        .from('user_activities' as any)
        .insert({
          user_id: userId,
          activity_type: activityType,
          details,
          is_public: isPublic,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      console.error('Error recording activity:', err);
      setError(err);
      return null;
    } finally {
      setRecording(false);
    }
  };

  return { recordActivity, recording, error };
}
