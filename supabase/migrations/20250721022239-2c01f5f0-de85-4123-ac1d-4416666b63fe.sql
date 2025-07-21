-- Fix RLS policies for student_pokemon_collection to allow teachers to award Pokemon to students

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Students can manage their own pokemon" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Students can view their own collection" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can award pokemon to students" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can remove pokemon from collections" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can view all collections" ON student_pokemon_collection;

-- Create clear, non-conflicting policies
-- Students can view their own collection
CREATE POLICY "Students can view own collection" 
ON student_pokemon_collection FOR SELECT 
USING (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT user_id FROM students WHERE user_id = auth.uid()
  ) OR
  student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  )
);

-- Students can manage (insert/update/delete) their own collection
CREATE POLICY "Students can manage own collection" 
ON student_pokemon_collection FOR ALL
USING (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT user_id FROM students WHERE user_id = auth.uid()
  ) OR
  student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT user_id FROM students WHERE user_id = auth.uid()
  ) OR
  student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  )
);

-- Teachers can view all collections
CREATE POLICY "Teachers can view all collections" 
ON student_pokemon_collection FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
);

-- Teachers can insert Pokemon for any student (award Pokemon)
CREATE POLICY "Teachers can award pokemon" 
ON student_pokemon_collection FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
);

-- Teachers can delete Pokemon from any collection (remove Pokemon)
CREATE POLICY "Teachers can remove pokemon" 
ON student_pokemon_collection FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
);