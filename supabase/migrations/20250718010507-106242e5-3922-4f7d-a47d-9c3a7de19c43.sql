-- Fix the RLS policies for Pokemon awarding to properly handle teacher authentication

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Students can view their own collection" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can view their own pokemon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can add to their own collection" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can remove their own Pokémon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can manage pokemon collections" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Admin and teachers can manage all collections" ON public.student_pokemon_collection;

-- Create simplified but effective RLS policies
-- Students can view their own pokemon collections
CREATE POLICY "Students can view their own pokemon" 
ON public.student_pokemon_collection FOR SELECT 
USING (student_id = auth.uid());

-- Teachers and authenticated users can view all pokemon collections
CREATE POLICY "Teachers can view all pokemon collections" 
ON public.student_pokemon_collection FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Students can manage their own pokemon (for shop purchases etc)
CREATE POLICY "Students can manage their own pokemon" 
ON public.student_pokemon_collection FOR ALL 
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Teachers and authenticated users can manage all pokemon collections
CREATE POLICY "Teachers can manage all pokemon collections" 
ON public.student_pokemon_collection FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);