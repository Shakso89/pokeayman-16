
-- Enable RLS on user_roles table if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users with specific emails to insert an 'owner' role for themselves.
-- This solves the initial problem of an owner not being in the database yet.
CREATE POLICY "Allow owner-users to claim their role"
ON public.user_roles
FOR INSERT
WITH CHECK (
    role = 'owner' AND
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND email IN (
            'ayman.soliman.tr@gmail.com',
            'ayman.soliman.cc@gmail.com',
            'ayman@pokeayman.com',
            'ayman.soliman.tr@gmail.com',
            'ayman.soliman.cc@gmail.com'
        )
    )
);

-- Policy to allow users who already have the 'owner' role to manage all roles.
CREATE POLICY "Owners can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));
