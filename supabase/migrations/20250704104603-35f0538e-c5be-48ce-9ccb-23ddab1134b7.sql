-- Check existing policies and clean them up
DROP POLICY IF EXISTS "Authenticated users can manage Pokemon collections" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Students can view their Pokemon collection" ON student_pokemon_collection;
DROP POLICY IF EXISTS "System can add Pokemon to collections" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow authenticated users to manage pokemon collections" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow authenticated users to view all Pokemon collections" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow authenticated users to award Pokemon to students" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow authenticated users to remove Pokemon from collections" ON student_pokemon_collection;

-- Create simple and effective RLS policies
CREATE POLICY "Students can access their Pokemon collection" 
ON student_pokemon_collection FOR ALL 
USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM student_profiles sp 
    WHERE sp.user_id = auth.uid() 
    AND sp.user_id = student_pokemon_collection.student_id
  ) OR
  auth.role() = 'authenticated'
)
WITH CHECK (
  student_id = auth.uid() OR 
  auth.role() = 'authenticated'
);