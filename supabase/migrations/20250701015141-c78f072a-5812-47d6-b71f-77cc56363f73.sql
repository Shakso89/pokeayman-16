
-- Ensure RLS policies exist for student_pokemon_collection table
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow insert for authenticated students" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow select for own collection" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow teachers to insert pokemon" ON student_pokemon_collection;

-- Create comprehensive RLS policies for student_pokemon_collection
CREATE POLICY "Allow insert for authenticated students" 
ON student_pokemon_collection FOR INSERT 
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Allow select for own collection" 
ON student_pokemon_collection FOR SELECT 
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Allow teachers to insert pokemon" 
ON student_pokemon_collection FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Ensure the table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_pokemon_collection_student_lookup 
ON student_pokemon_collection(student_id, awarded_at DESC);

-- Add spent_coins column to student_profiles if it doesn't exist
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS spent_coins INTEGER DEFAULT 0;
