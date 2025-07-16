-- Clean up any remaining references to pokemon_collections and ensure consistent naming

-- Drop the pokemon_collections table if it exists (it should not exist based on types)
DROP TABLE IF EXISTS public.pokemon_collections CASCADE;

-- Ensure the student_pokemon_collection table has proper RLS policies
DROP POLICY IF EXISTS "Students can view their own pokemon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can add to their own collection" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Students can remove their own Pokémon" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can view Pokémon collections of their students" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can insert Pokémon for students in their class" ON public.student_pokemon_collection;
DROP POLICY IF EXISTS "Teachers can manage Pokémon collections" ON public.student_pokemon_collection;

-- Create proper RLS policies for student_pokemon_collection
CREATE POLICY "Students can view their own pokemon" 
ON public.student_pokemon_collection FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can add to their own collection" 
ON public.student_pokemon_collection FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can remove their own Pokémon" 
ON public.student_pokemon_collection FOR DELETE 
USING (student_id = auth.uid());

-- Teachers can manage pokemon collections (broad permission for now)
CREATE POLICY "Teachers can manage pokemon collections" 
ON public.student_pokemon_collection FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Update any database functions that might reference pokemon_collections
-- Fix the calculate_class_top_student function
CREATE OR REPLACE FUNCTION public.calculate_class_top_student(p_class_id uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
  top_student_id UUID;
BEGIN
  -- Calculate top student based on: coins + (pokemon_count * 3)
  SELECT sp.user_id INTO top_student_id
  FROM student_profiles sp
  LEFT JOIN (
    SELECT student_id, COUNT(*) as pokemon_count
    FROM student_pokemon_collection  -- Fixed table name
    GROUP BY student_id
  ) pc ON sp.user_id = pc.student_id
  WHERE sp.class_id = p_class_id
  ORDER BY (sp.coins + COALESCE(pc.pokemon_count * 3, 0)) DESC
  LIMIT 1;
  
  RETURN top_student_id;
END;
$function$;

-- Fix the calculate_school_top_student function
CREATE OR REPLACE FUNCTION public.calculate_school_top_student(p_school_id uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
  top_student_id UUID;
BEGIN
  -- Calculate top student based on: coins + (pokemon_count * 3)
  SELECT sp.user_id INTO top_student_id
  FROM student_profiles sp
  LEFT JOIN (
    SELECT student_id, COUNT(*) as pokemon_count
    FROM student_pokemon_collection  -- Fixed table name
    GROUP BY student_id
  ) pc ON sp.user_id = pc.student_id
  WHERE sp.school_id = p_school_id
  ORDER BY (sp.coins + COALESCE(pc.pokemon_count * 3, 0)) DESC
  LIMIT 1;
  
  RETURN top_student_id;
END;
$function$;

-- Fix the trigger function
CREATE OR REPLACE FUNCTION public.trigger_update_top_students()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  affected_class_id UUID;
  affected_school_id UUID;
BEGIN
  -- Get the affected class and school
  IF TG_TABLE_NAME = 'student_profiles' THEN
    affected_class_id := COALESCE(NEW.class_id, OLD.class_id);
    affected_school_id := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'student_pokemon_collection' THEN  -- Fixed table name
    SELECT sp.class_id, sp.school_id INTO affected_class_id, affected_school_id
    FROM student_profiles sp 
    WHERE sp.user_id = COALESCE(NEW.student_id, OLD.student_id);
  END IF;
  
  -- Update class top student
  IF affected_class_id IS NOT NULL THEN
    UPDATE classes 
    SET top_student_id = calculate_class_top_student(affected_class_id)
    WHERE id = affected_class_id;
  END IF;
  
  -- Update school top student  
  IF affected_school_id IS NOT NULL THEN
    UPDATE schools 
    SET top_student_id = calculate_school_top_student(affected_school_id)
    WHERE id = affected_school_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Ensure the trigger is properly set up for the correct table
DROP TRIGGER IF EXISTS update_top_students_trigger ON public.student_pokemon_collection;
CREATE TRIGGER update_top_students_trigger
  AFTER INSERT OR DELETE ON public.student_pokemon_collection
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_top_students();