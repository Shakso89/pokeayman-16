
-- First, let's check and fix the foreign key relationships for pokemon_collections
-- Drop the existing foreign key constraint that's causing issues
ALTER TABLE public.pokemon_collections 
DROP CONSTRAINT IF EXISTS pokemon_collections_student_id_fkey;

-- Add the correct foreign key constraint to reference students table user_id
ALTER TABLE public.pokemon_collections 
ADD CONSTRAINT pokemon_collections_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;

-- Ensure teachers can insert/update/delete pokemon collections
DROP POLICY IF EXISTS "Teachers can manage pokemon collections" ON public.pokemon_collections;
CREATE POLICY "Teachers can manage pokemon collections" 
ON public.pokemon_collections 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Ensure teachers can update student coins
DROP POLICY IF EXISTS "Teachers can update students" ON public.students;
CREATE POLICY "Teachers can update students" 
ON public.students 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Ensure teachers can manage student profiles
DROP POLICY IF EXISTS "Teachers can manage student profiles" ON public.student_profiles;
CREATE POLICY "Teachers can manage student profiles" 
ON public.student_profiles 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Add coins column to students table if it doesn't exist
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS coins integer DEFAULT 0;

-- Ensure coin_history table allows teacher access
DROP POLICY IF EXISTS "Teachers can manage coin history" ON public.coin_history;
CREATE POLICY "Teachers can manage coin history" 
ON public.coin_history 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
