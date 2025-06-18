
-- Create RLS policies for student_profiles table to allow operations
CREATE POLICY "Allow all operations on student_profiles" 
  ON public.student_profiles 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Also ensure we can read from students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on students" 
  ON public.students 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
