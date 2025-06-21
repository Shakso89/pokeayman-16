
-- Add star_student_id and top_student_id columns to classes table
ALTER TABLE public.classes 
ADD COLUMN star_student_id UUID,
ADD COLUMN top_student_id UUID;

-- Add top_student_id column to schools table  
ALTER TABLE public.schools
ADD COLUMN top_student_id UUID;

-- Create index for performance on star student lookups
CREATE INDEX idx_classes_star_student ON public.classes(star_student_id);
CREATE INDEX idx_classes_top_student ON public.classes(top_student_id);
CREATE INDEX idx_schools_top_student ON public.schools(top_student_id);

-- Create function to calculate top student in a class
CREATE OR REPLACE FUNCTION calculate_class_top_student(p_class_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  top_student_id UUID;
BEGIN
  -- Calculate top student based on: coins + (pokemon_count * 3)
  SELECT sp.user_id INTO top_student_id
  FROM student_profiles sp
  LEFT JOIN (
    SELECT student_id, COUNT(*) as pokemon_count
    FROM pokemon_collections
    GROUP BY student_id
  ) pc ON sp.user_id = pc.student_id
  WHERE sp.class_id = p_class_id
  ORDER BY (sp.coins + COALESCE(pc.pokemon_count * 3, 0)) DESC
  LIMIT 1;
  
  RETURN top_student_id;
END;
$$;

-- Create function to calculate top student in a school
CREATE OR REPLACE FUNCTION calculate_school_top_student(p_school_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  top_student_id UUID;
BEGIN
  -- Calculate top student based on: coins + (pokemon_count * 3)
  SELECT sp.user_id INTO top_student_id
  FROM student_profiles sp
  LEFT JOIN (
    SELECT student_id, COUNT(*) as pokemon_count
    FROM pokemon_collections
    GROUP BY student_id
  ) pc ON sp.user_id = pc.student_id
  WHERE sp.school_id = p_school_id
  ORDER BY (sp.coins + COALESCE(pc.pokemon_count * 3, 0)) DESC
  LIMIT 1;
  
  RETURN top_student_id;
END;
$$;

-- Create function to update top students (can be called manually or via cron)
CREATE OR REPLACE FUNCTION update_top_students()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  class_record RECORD;
  school_record RECORD;
BEGIN
  -- Update top student for each class
  FOR class_record IN SELECT id, school_id FROM classes LOOP
    UPDATE classes 
    SET top_student_id = calculate_class_top_student(class_record.id)
    WHERE id = class_record.id;
  END LOOP;
  
  -- Update top student for each school
  FOR school_record IN SELECT id FROM schools LOOP
    UPDATE schools 
    SET top_student_id = calculate_school_top_student(school_record.id)
    WHERE id = school_record.id;
  END LOOP;
END;
$$;

-- Create trigger to auto-update top students when coins or pokemon change
CREATE OR REPLACE FUNCTION trigger_update_top_students()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_class_id UUID;
  affected_school_id UUID;
BEGIN
  -- Get the affected class and school
  IF TG_TABLE_NAME = 'student_profiles' THEN
    affected_class_id := COALESCE(NEW.class_id, OLD.class_id);
    affected_school_id := COALESCE(NEW.school_id, OLD.school_id);
  ELSIF TG_TABLE_NAME = 'pokemon_collections' THEN
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
$$;

-- Create triggers
CREATE TRIGGER update_top_students_on_coins
  AFTER UPDATE OF coins ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_top_students();

CREATE TRIGGER update_top_students_on_pokemon
  AFTER INSERT OR DELETE ON pokemon_collections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_top_students();
