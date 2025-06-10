
-- First, let's add the unique constraint that's needed for the ON CONFLICT clause
ALTER TABLE public.teacher_credits ADD CONSTRAINT teacher_credits_teacher_id_unique UNIQUE (teacher_id);

-- Now fix the trigger function with the correct constraint reference
CREATE OR REPLACE FUNCTION public.update_supervisor_credits()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update to use the new enum values: 'manager' and 'owner' instead of 'supervisor' and 'admin'
  IF NEW.role IN ('manager', 'owner') THEN
    INSERT INTO public.teacher_credits (teacher_id, credits, unlimited_credits)
    VALUES (NEW.user_id, 999999, TRUE)
    ON CONFLICT (teacher_id) 
    DO UPDATE SET unlimited_credits = TRUE, credits = 999999;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update any existing Ayman accounts to have owner role
UPDATE public.teachers 
SET role = 'owner'::app_role 
WHERE username ILIKE 'ayman' 
   OR email ILIKE 'ayman.soliman.tr@gmail.com' 
   OR email ILIKE 'ayman.soliman.cc@gmail.com'
   OR display_name ILIKE 'ayman';

-- Insert owner role in user_roles table for Ayman accounts
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT id, 'owner'::app_role, id
FROM public.teachers 
WHERE (username ILIKE 'ayman' 
   OR email ILIKE 'ayman.soliman.tr@gmail.com' 
   OR email ILIKE 'ayman.soliman.cc@gmail.com'
   OR display_name ILIKE 'ayman')
   AND id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure teacher_credits table has unlimited credits for owners
INSERT INTO public.teacher_credits (teacher_id, credits, unlimited_credits)
SELECT id, 999999, true
FROM public.teachers 
WHERE role = 'owner'::app_role
ON CONFLICT (teacher_id) 
DO UPDATE SET 
  unlimited_credits = true, 
  credits = 999999;

-- Create function to sync username/email logins to same account
CREATE OR REPLACE FUNCTION public.get_teacher_by_login(login_input text)
RETURNS TABLE(
  id uuid,
  username text,
  email text,
  display_name text,
  password text,
  role app_role,
  is_active boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.username, t.email, t.display_name, t.password, t.role, t.is_active
  FROM public.teachers t
  WHERE t.username ILIKE login_input 
     OR t.email ILIKE login_input
  LIMIT 1;
END;
$$;
