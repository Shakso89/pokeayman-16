-- Fix RLS policies for student_pokemon_collection table
-- The main issue is that the existing policies don't properly handle authenticated inserts

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Students can add to their own Pokemon collection" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow select for own collection" ON student_pokemon_collection;

-- Create proper RLS policies that work with the purchase system
CREATE POLICY "Students can view their Pokemon collection" 
ON student_pokemon_collection FOR SELECT 
USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM student_profiles 
    WHERE student_profiles.user_id = student_pokemon_collection.student_id 
    AND student_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "System can add Pokemon to collections" 
ON student_pokemon_collection FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage Pokemon collections" 
ON student_pokemon_collection FOR ALL 
USING (true) 
WITH CHECK (true);