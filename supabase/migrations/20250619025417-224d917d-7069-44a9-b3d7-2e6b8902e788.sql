
-- Create a table for admin/owner notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy to allow owners to see all notifications (simplified for now)
CREATE POLICY "Owners can view all admin notifications"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow system to insert notifications
CREATE POLICY "Allow system to insert admin notifications"
ON public.admin_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
