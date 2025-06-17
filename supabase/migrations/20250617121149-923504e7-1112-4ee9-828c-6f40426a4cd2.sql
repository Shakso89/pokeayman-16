
-- First, let's modify the students table to support the new signup approach
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS teacher_username TEXT;

-- Update the student_profiles table to better support the new role-based approach
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Create an index for better performance on school lookups
CREATE INDEX IF NOT EXISTS idx_students_school_name ON public.students(school_name);
CREATE INDEX IF NOT EXISTS idx_students_teacher_username ON public.students(teacher_username);

-- Add RLS policies for students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Students can view their own data
CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (auth.uid() = id);

-- Students can update their own data
CREATE POLICY "Students can update own data" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- Allow students to insert their own records during signup
CREATE POLICY "Students can insert own record" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teachers can view students in their school
CREATE POLICY "Teachers can view students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid()
    )
  );

-- Add RLS policies for student_profiles table
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own profiles
CREATE POLICY "Students can manage own profile" ON public.student_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Teachers can view student profiles
CREATE POLICY "Teachers can view student profiles" ON public.student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid()
    )
  );
