
-- Add user_id column to students table to maintain compatibility with existing code
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Update existing students to have user_id = id for backward compatibility
UPDATE public.students 
SET user_id = id 
WHERE user_id IS NULL;

-- Make user_id not null after populating it
ALTER TABLE public.students 
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint to user_id
ALTER TABLE public.students 
ADD CONSTRAINT students_user_id_unique UNIQUE (user_id);

-- Create trigger to automatically set user_id = id for new students
CREATE OR REPLACE FUNCTION public.set_student_user_id()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Set user_id to be the same as id for new students
  NEW.user_id = NEW.id;
  RETURN NEW;
END;
$function$;

-- Create trigger that fires before insert
DROP TRIGGER IF EXISTS trigger_set_student_user_id ON public.students;
CREATE TRIGGER trigger_set_student_user_id
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.set_student_user_id();

-- Update student_profiles to reference the correct user_id
-- First, update existing student_profiles to use the correct user_id from students table
UPDATE public.student_profiles 
SET user_id = s.user_id 
FROM public.students s 
WHERE student_profiles.user_id = s.id AND s.user_id != s.id;
