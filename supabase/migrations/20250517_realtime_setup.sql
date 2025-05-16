
-- Create a materialized view to store user activities efficiently
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_activity_summary AS
SELECT 
  user_id,
  activity_type,
  COUNT(*) as activity_count,
  MAX(created_at) as last_activity
FROM 
  public.user_activities
GROUP BY 
  user_id, 
  activity_type;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id_type ON public.user_activity_summary(user_id, activity_type);

-- Create a refresh function for the materialized view
CREATE OR REPLACE FUNCTION public.refresh_user_activity_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_activity_summary;
  RETURN NULL;
END;
$$;

-- Create a trigger to refresh the materialized view when user_activities is updated
DROP TRIGGER IF EXISTS refresh_user_activity_summary_trigger ON public.user_activities;
CREATE TRIGGER refresh_user_activity_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_activities
FOR EACH STATEMENT
EXECUTE PROCEDURE public.refresh_user_activity_summary();

-- Function to enable realtime for specific tables
CREATE OR REPLACE FUNCTION public.enable_realtime(table_names text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_name text;
BEGIN
  -- Loop through each table and set up realtime
  FOREACH table_name IN ARRAY table_names
  LOOP
    -- Set the replica identity to FULL for better change tracking
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', table_name);
    
    -- Add the table to the supabase_realtime publication
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
      RAISE NOTICE 'Added table % to supabase_realtime publication', table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add table % to publication: %', table_name, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Function to publish user activity to all followers
CREATE OR REPLACE FUNCTION public.publish_activity_to_followers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the activity is public, no action needed as it will be picked up by global subscription
  IF NEW.is_public THEN
    RETURN NEW;
  END IF;

  -- Here you would typically publish to followers
  -- This depends on your social graph structure
  -- For example, assuming a followers table:
  -- INSERT INTO notifications (user_id, message, related_activity)
  -- SELECT follower_id, 'New activity from ' || NEW.user_id, NEW.id
  -- FROM followers WHERE followed_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create a trigger for the activity publishing function
DROP TRIGGER IF EXISTS publish_activity_trigger ON public.user_activities;
CREATE TRIGGER publish_activity_trigger
AFTER INSERT ON public.user_activities
FOR EACH ROW
EXECUTE PROCEDURE public.publish_activity_to_followers();
