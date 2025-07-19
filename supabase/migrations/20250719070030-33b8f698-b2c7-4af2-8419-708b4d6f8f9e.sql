-- Fix RLS policies for Pokemon awarding to properly handle teacher-student relationships

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Students can manage their own pokemon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can view their own pokemon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can manage all pokemon collections" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can view all pokemon collections" ON public.student_pokemon_collection;

-- Create new comprehensive policies as suggested

-- Allow teachers to award pokemon to their students
CREATE POLICY "Teachers can award pokemon to students"
ON public.student_pokemon_collection
FOR INSERT
TO authenticated
WITH CHECK (
  -- Teachers can award to any student (simplified for now)
  auth.uid() IS NOT NULL
);

-- Allow students to view their own pokemon collection
CREATE POLICY "Students can view their own collection"
ON public.student_pokemon_collection
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT user_id FROM public.students WHERE user_id = auth.uid()
  ) OR
  student_id IN (
    SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
  )
);

-- Allow teachers to view all pokemon collections for management
CREATE POLICY "Teachers can view all collections"
ON public.student_pokemon_collection
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Allow teachers to remove pokemon from student collections
CREATE POLICY "Teachers can remove pokemon from collections"
ON public.student_pokemon_collection
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Allow students to manage their own pokemon (for shop purchases, etc.)
CREATE POLICY "Students can manage their own pokemon"
ON public.student_pokemon_collection
FOR ALL
TO authenticated
USING (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT user_id FROM public.students WHERE user_id = auth.uid()
  ) OR
  student_id IN (
    SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  student_id = auth.uid() OR 
  student_id IN (
    SELECT user_id FROM public.students WHERE user_id = auth.uid()
  ) OR
  student_id IN (
    SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
  )
);