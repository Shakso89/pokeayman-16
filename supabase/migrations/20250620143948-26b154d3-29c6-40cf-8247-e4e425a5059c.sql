
-- First, let's add the missing role column to user_roles table
-- We need to create the app_role enum first if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('teacher', 'senior_teacher', 'manager', 'owner');
    END IF;
END $$;

-- Add the role column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS role app_role NOT NULL DEFAULT 'teacher';

-- Also add the role column to teachers table if it doesn't exist
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS role app_role NOT NULL DEFAULT 'teacher';

-- Now create the assign_user_role function with proper role enum support
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid, 
  new_role text,
  assigned_school_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update the role in user_roles table
  INSERT INTO public.user_roles (user_id, role, assigned_by, manager_school_id)
  VALUES (target_user_id, new_role::app_role, auth.uid(), 
    CASE WHEN new_role = 'manager' THEN assigned_school_id ELSE NULL END)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = new_role::app_role,
    assigned_by = auth.uid(), 
    assigned_at = now(),
    manager_school_id = CASE WHEN new_role = 'manager' THEN assigned_school_id ELSE NULL END;
  
  -- Also update the teachers table if the user exists there
  UPDATE public.teachers
  SET role = new_role::app_role
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions to the necessary roles
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, text, uuid) TO anon, authenticated, service_role;

-- Create the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role::app_role
  )
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon, authenticated, service_role;
