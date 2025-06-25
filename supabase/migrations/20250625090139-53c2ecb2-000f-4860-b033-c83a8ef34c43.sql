
-- Fix RLS policies for student_pokemon_collection table
DROP POLICY IF EXISTS "Students can view their own pokemon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Allow authenticated users to manage collections" ON public.student_pokemon_collection;

-- Create proper policies for student_pokemon_collection
CREATE POLICY "Students can view their own pokemon collection" 
ON public.student_pokemon_collection FOR SELECT 
USING (student_id = auth.uid() OR student_id IN (
  SELECT user_id FROM public.students WHERE user_id = auth.uid()
));

CREATE POLICY "Students can insert into their own collection" 
ON public.student_pokemon_collection FOR INSERT 
WITH CHECK (student_id = auth.uid() OR student_id IN (
  SELECT user_id FROM public.students WHERE user_id = auth.uid()
));

CREATE POLICY "Allow authenticated users to manage pokemon collections" 
ON public.student_pokemon_collection FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

-- Fix RLS policies for daily_attempts table
DROP POLICY IF EXISTS "Students can manage their daily attempts" ON public.daily_attempts;

-- Create proper policies for daily_attempts
CREATE POLICY "Students can view their own daily attempts" 
ON public.daily_attempts FOR SELECT 
USING (student_id = auth.uid() OR student_id IN (
  SELECT user_id FROM public.students WHERE user_id = auth.uid()
));

CREATE POLICY "Students can insert their own daily attempts" 
ON public.daily_attempts FOR INSERT 
WITH CHECK (student_id = auth.uid() OR student_id IN (
  SELECT user_id FROM public.students WHERE user_id = auth.uid()
));

CREATE POLICY "Students can update their own daily attempts" 
ON public.daily_attempts FOR UPDATE 
USING (student_id = auth.uid() OR student_id IN (
  SELECT user_id FROM public.students WHERE user_id = auth.uid()
));

CREATE POLICY "Allow authenticated users to manage daily attempts" 
ON public.daily_attempts FOR ALL TO authenticated 
USING (true) WITH CHECK (true);
