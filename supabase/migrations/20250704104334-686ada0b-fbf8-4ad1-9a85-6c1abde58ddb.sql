-- Fix RLS policies for student_pokemon_collection to allow proper access
DROP POLICY IF EXISTS "Students can view their Pokemon collection" ON student_pokemon_collection;
DROP POLICY IF EXISTS "System can add Pokemon to collections" ON student_pokemon_collection;

-- Create more permissive RLS policies that allow students to view their Pokemon
CREATE POLICY "Students can view their own Pokemon collection" 
ON student_pokemon_collection FOR SELECT 
USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM student_profiles sp 
    WHERE sp.user_id = auth.uid() 
    AND sp.user_id = student_pokemon_collection.student_id
  )
);

CREATE POLICY "Authenticated users can manage Pokemon collections" 
ON student_pokemon_collection FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');