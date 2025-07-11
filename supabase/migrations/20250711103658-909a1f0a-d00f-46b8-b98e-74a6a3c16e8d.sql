
-- Update RLS policies for student_classes table to allow teachers to insert records
DROP POLICY IF EXISTS "Teachers can manage class assignments" ON student_classes;

-- Create a more permissive policy for teachers to manage class assignments
CREATE POLICY "Teachers can manage class assignments" ON student_classes
FOR ALL
USING (
  -- Allow if user is a teacher (exists in teachers table)
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR
  -- Allow if user is the teacher of the class
  EXISTS (SELECT 1 FROM classes WHERE id = class_id AND teacher_id = auth.uid())
)
WITH CHECK (
  -- Allow if user is a teacher (exists in teachers table)
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR
  -- Allow if user is the teacher of the class
  EXISTS (SELECT 1 FROM classes WHERE id = class_id AND teacher_id = auth.uid())
);

-- Also ensure teachers can insert into student_profiles
DROP POLICY IF EXISTS "Teachers can manage student profiles" ON student_profiles;

CREATE POLICY "Teachers can manage student profiles" ON student_profiles
FOR ALL
USING (
  -- Allow if user is a teacher
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
)
WITH CHECK (
  -- Allow if user is a teacher
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
);
