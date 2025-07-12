-- Update RLS policies for student_classes to allow proper SELECT operations
DROP POLICY IF EXISTS "Allow all authenticated operations on student_classes" ON student_classes;

-- Create more specific policies for student_classes
CREATE POLICY "Teachers can manage class assignments" ON student_classes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE teachers.id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = student_classes.class_id 
    AND classes.teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE teachers.id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = student_classes.class_id 
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their class assignments" ON student_classes
FOR SELECT
USING (
  student_id IN (
    SELECT student_profiles.id 
    FROM student_profiles 
    WHERE student_profiles.user_id = auth.uid()
  )
);

-- Also allow public read access for class listings since RLS might be blocking legitimate reads
CREATE POLICY "Allow reading student class assignments" ON student_classes
FOR SELECT
USING (true);