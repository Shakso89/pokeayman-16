
-- Update the get_user_role function to prioritize owner role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (SELECT role 
     FROM public.user_roles 
     WHERE user_id = _user_id 
     ORDER BY 
       CASE role
         WHEN 'owner' THEN 5
         WHEN 'admin' THEN 4
         WHEN 'supervisor' THEN 3
         WHEN 'senior_teacher' THEN 2
         WHEN 'teacher' THEN 1
       END DESC
     LIMIT 1),
    'teacher'::app_role
  )
$function$;

-- Update assign_user_role function to allow owners to assign any role
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if the caller is an owner or admin
  IF NOT (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Only owners and admins can assign roles';
  END IF;
  
  -- Owners can assign any role, admins cannot assign owner role
  IF new_role = 'owner' AND NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only owners can assign owner role';
  END IF;
  
  -- Insert or update the role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, new_role, auth.uid())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET assigned_by = auth.uid(), assigned_at = now();
  
  -- Update the teachers table as well
  UPDATE public.teachers
  SET role = new_role
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$function$;

-- Update manage_user_credits function to require owner role
CREATE OR REPLACE FUNCTION public.manage_user_credits(target_user_id uuid, credit_amount integer, reason text DEFAULT 'Owner adjustment'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if the caller is an owner
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only owners can manage other users credits';
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
$function$;
