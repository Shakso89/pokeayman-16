
-- Remove the foreign key constraint from student_profiles table
-- since students don't exist in auth.users table
ALTER TABLE public.student_profiles 
DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey;

-- Add a comment to clarify that user_id references students table, not auth.users
COMMENT ON COLUMN public.student_profiles.user_id IS 'References students.id, not auth.users';
