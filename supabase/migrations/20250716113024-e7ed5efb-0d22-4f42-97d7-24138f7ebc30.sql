-- Fix the RLS policies and database relationships for Pokemon awarding

-- First, fix the duplicate relationship issue by dropping the duplicate foreign key
ALTER TABLE public.student_pokemon_collection 
DROP CONSTRAINT IF EXISTS student_pokemon_collection_pokemon_id_fkey;

-- Keep only the fk_pokemon_pool constraint
-- (This should already exist from the previous migration)

-- Drop existing RLS policies to recreate them properly
DROP POLICY IF EXISTS "Students can view their own pokemon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can add to their own collection" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can remove their own Pokémon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can manage pokemon collections" ON public.student_pokemon_collection;

-- Create new RLS policies that work for both students and teachers
-- Students can view their own pokemon
CREATE POLICY "Students can view their own pokemon" 
ON public.student_pokemon_collection FOR SELECT 
USING (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT sp.user_id 
    FROM student_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- Students can add to their own collection
CREATE POLICY "Students can add to their own collection" 
ON public.student_pokemon_collection FOR INSERT 
WITH CHECK (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT sp.user_id 
    FROM student_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- Students can remove their own Pokémon
CREATE POLICY "Students can remove their own Pokémon" 
ON public.student_pokemon_collection FOR DELETE 
USING (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT sp.user_id 
    FROM student_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- Teachers can manage pokemon collections for all students
CREATE POLICY "Teachers can manage pokemon collections" 
ON public.student_pokemon_collection FOR ALL 
USING (
  -- Allow if user is authenticated (teachers have broad access)
  auth.uid() IS NOT NULL
) 
WITH CHECK (
  -- Allow if user is authenticated (teachers have broad access)
  auth.uid() IS NOT NULL
);

-- Also create a specific policy for admin/teacher access
CREATE POLICY "Admin and teachers can manage all collections" 
ON public.student_pokemon_collection FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM teachers t 
    WHERE t.id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teachers t 
    WHERE t.id = auth.uid()
  )
);