
-- Add school_id to student_profiles if not exists and make it required
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Create student_classes junction table for multiple class assignments
CREATE TABLE IF NOT EXISTS public.student_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Create achievements table for tracking student achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('homework_streak', 'star_of_class', 'pokemon_master', 'coin_collector')) NOT NULL,
  value INTEGER DEFAULT 0,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  awarded_by UUID, -- teacher who awarded it
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- for storing additional achievement data
  UNIQUE(student_id, type, class_id) -- ensures one star per class per student
);

-- Modify pokemon_pools to properly track available vs assigned
ALTER TABLE public.pokemon_pools 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.student_profiles(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

-- Update available field when pokemon is assigned
CREATE OR REPLACE FUNCTION assign_pokemon_to_student()
RETURNS TRIGGER AS $$
BEGIN
  -- When a pokemon is assigned to a student, mark it as unavailable
  IF NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS NULL THEN
    NEW.available = FALSE;
    NEW.assigned_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pokemon assignment
DROP TRIGGER IF EXISTS pokemon_assignment_trigger ON public.pokemon_pools;
CREATE TRIGGER pokemon_assignment_trigger
  BEFORE UPDATE ON public.pokemon_pools
  FOR EACH ROW
  EXECUTE FUNCTION assign_pokemon_to_student();

-- Add RLS policies for new tables
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_classes
CREATE POLICY "Students can view their class assignments" 
  ON public.student_classes 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can manage class assignments" 
  ON public.student_classes 
  FOR ALL 
  TO authenticated
  USING (true);

-- RLS policies for achievements
CREATE POLICY "Students can view their achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can manage achievements" 
  ON public.achievements 
  FOR ALL 
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON public.student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class_id ON public.student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON public.achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_class_id ON public.achievements(class_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_pools_assigned_to ON public.pokemon_pools(assigned_to);
CREATE INDEX IF NOT EXISTS idx_student_profiles_school_id ON public.student_profiles(school_id);

-- Function to calculate homework streak (fixed variable name)
CREATE OR REPLACE FUNCTION calculate_homework_streak(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  submission_date DATE;
BEGIN
  -- Count consecutive days with submissions working backwards from today
  FOR submission_date IN 
    SELECT DISTINCT DATE(submitted_at) 
    FROM public.homework_submissions 
    WHERE student_id = p_student_id 
    ORDER BY DATE(submitted_at) DESC
  LOOP
    IF submission_date = check_date THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT; -- Break streak
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to award star of class (ensuring only one per class)
CREATE OR REPLACE FUNCTION award_star_of_class(
  p_student_id UUID,
  p_class_id UUID,
  p_awarded_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove existing star from class
  UPDATE public.achievements 
  SET is_active = FALSE 
  WHERE type = 'star_of_class' 
    AND class_id = p_class_id 
    AND is_active = TRUE;
  
  -- Award new star
  INSERT INTO public.achievements (student_id, type, value, class_id, awarded_by)
  VALUES (p_student_id, 'star_of_class', 50, p_class_id, p_awarded_by);
  
  -- Award 50 coins to student
  UPDATE public.student_profiles 
  SET coins = coins + 50 
  WHERE id = p_student_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
