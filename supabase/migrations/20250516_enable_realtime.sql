
-- This file contains SQL to set up the enable_realtime RPC function and
-- configure realtime subscriptions for tables

-- Function to enable realtime subscriptions for specific tables
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
    
    -- Add the table to the supabase_realtime publication if it exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;

-- To execute this function, use:
-- SELECT enable_realtime(ARRAY['students', 'classes', 'schools', 'teachers']);
