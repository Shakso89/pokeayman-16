
-- First, drop all dependent functions and policies that use the old enum
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.assign_user_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.manage_user_credits(uuid, integer, text);

-- Now we can safely update the enum
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('teacher', 'senior_teacher', 'manager', 'owner');

-- Update user_roles table
ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING 
  CASE 
    WHEN role::text = 'admin' THEN 'owner'::public.app_role
    WHEN role::text = 'supervisor' THEN 'manager'::public.app_role
    ELSE role::text::public.app_role
  END;
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'teacher'::public.app_role;

-- Update teachers table
ALTER TABLE public.teachers ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.teachers ALTER COLUMN role TYPE public.app_role USING 
  CASE 
    WHEN role::text = 'admin' THEN 'owner'::public.app_role
    WHEN role::text = 'supervisor' THEN 'manager'::public.app_role
    ELSE role::text::public.app_role
  END;
ALTER TABLE public.teachers ALTER COLUMN role SET DEFAULT 'teacher'::public.app_role;

-- Drop the old enum
DROP TYPE public.app_role_old CASCADE;

-- Add manager_school_id column to user_roles for manager assignments
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS manager_school_id uuid REFERENCES public.schools(id);

-- Create index for better performance on manager school lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_manager_school ON public.user_roles(manager_school_id) WHERE role = 'manager';

-- Recreate the has_role function with new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recreate the get_user_role function for new role hierarchy
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role 
     FROM public.user_roles 
     WHERE user_id = _user_id 
     ORDER BY 
       CASE role
         WHEN 'owner' THEN 4
         WHEN 'manager' THEN 3
         WHEN 'senior_teacher' THEN 2
         WHEN 'teacher' THEN 1
       END DESC
     LIMIT 1),
    'teacher'::app_role
  )
$$;

-- Recreate the assign_user_role function to handle the new roles
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid, 
  new_role app_role,
  assigned_school_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the caller is an owner
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only owners can assign roles';
  END IF;
  
  -- Insert or update the role
  INSERT INTO public.user_roles (user_id, role, assigned_by, manager_school_id)
  VALUES (target_user_id, new_role, auth.uid(), 
    CASE WHEN new_role = 'manager' THEN assigned_school_id ELSE NULL END)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    assigned_by = auth.uid(), 
    assigned_at = now(),
    manager_school_id = CASE WHEN new_role = 'manager' THEN assigned_school_id ELSE NULL END;
  
  -- Update the teachers table as well
  UPDATE public.teachers
  SET role = new_role
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Recreate credit management function to handle new roles
CREATE OR REPLACE FUNCTION public.manage_user_credits(
  target_user_id uuid, 
  credit_amount integer, 
  reason text DEFAULT 'Credit adjustment'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the caller is an owner
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only owners can manage credits';
  END IF;
  
  -- Update credits
  INSERT INTO public.teacher_credits (teacher_id, credits, used_credits)
  VALUES (target_user_id, GREATEST(credit_amount, 0), 0)
  ON CONFLICT (teacher_id) 
  DO UPDATE SET 
    credits = GREATEST(teacher_credits.credits + credit_amount, 0),
    updated_at = now();
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (teacher_id, amount, reason)
  VALUES (target_user_id, credit_amount, reason);
  
  RETURN TRUE;
END;
$$;

-- Create function for managers to gift credits within their school
CREATE OR REPLACE FUNCTION public.gift_credits_in_school(
  target_user_id uuid, 
  credit_amount integer, 
  reason text DEFAULT 'Credit gift from manager'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  manager_school uuid;
  manager_credits integer;
BEGIN
  -- Check if the caller is a manager
  IF NOT public.has_role(auth.uid(), 'manager') THEN
    RAISE EXCEPTION 'Only managers can gift credits';
  END IF;
  
  -- Get manager's assigned school
  SELECT manager_school_id INTO manager_school
  FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'manager';
  
  -- Check if manager has enough credits
  SELECT credits INTO manager_credits
  FROM public.teacher_credits
  WHERE teacher_id = auth.uid();
  
  IF manager_credits < credit_amount THEN
    RAISE EXCEPTION 'Insufficient credits to gift';
  END IF;
  
  -- Deduct from manager
  UPDATE public.teacher_credits
  SET credits = credits - credit_amount
  WHERE teacher_id = auth.uid();
  
  -- Add to target user
  INSERT INTO public.teacher_credits (teacher_id, credits, used_credits)
  VALUES (target_user_id, credit_amount, 0)
  ON CONFLICT (teacher_id) 
  DO UPDATE SET credits = teacher_credits.credits + credit_amount;
  
  -- Log both transactions
  INSERT INTO public.credit_transactions (teacher_id, amount, reason)
  VALUES 
    (auth.uid(), -credit_amount, 'Gifted to ' || target_user_id::text),
    (target_user_id, credit_amount, reason);
  
  RETURN TRUE;
END;
$$;
