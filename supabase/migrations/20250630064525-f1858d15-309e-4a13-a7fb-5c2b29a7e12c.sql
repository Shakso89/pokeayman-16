
-- Drop existing policies first
DROP POLICY IF EXISTS "Students can view their own pokemon collection" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Students can insert their own pokemon purchases" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can view all pokemon collections" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can insert pokemon awards" ON student_pokemon_collection;
DROP POLICY IF EXISTS "Allow authenticated users to view pokemon pool" ON pokemon_pool;

-- Add foreign key constraint to pokemon_pool if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pokemon_pool'
        AND table_name = 'student_pokemon_collection'
    ) THEN
        ALTER TABLE student_pokemon_collection 
        ADD CONSTRAINT fk_pokemon_pool 
        FOREIGN KEY (pokemon_id) REFERENCES pokemon_pool(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on both tables
ALTER TABLE student_pokemon_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_pool ENABLE ROW LEVEL SECURITY;

-- Create policies for student_pokemon_collection
CREATE POLICY "Students can view their own pokemon collection" 
ON student_pokemon_collection FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own pokemon purchases" 
ON student_pokemon_collection FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view all pokemon collections" 
ON student_pokemon_collection FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM teachers WHERE id = auth.uid()
));

CREATE POLICY "Teachers can insert pokemon awards" 
ON student_pokemon_collection FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM teachers WHERE id = auth.uid()
));

-- Allow all authenticated users to view pokemon pool
CREATE POLICY "Allow authenticated users to view pokemon pool" 
ON pokemon_pool FOR SELECT 
TO authenticated 
USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_pokemon_collection_student_id 
ON student_pokemon_collection(student_id);

CREATE INDEX IF NOT EXISTS idx_student_pokemon_collection_pokemon_id 
ON student_pokemon_collection(pokemon_id);
