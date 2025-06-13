
-- Create students table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  teacher_id UUID,
  class_id UUID,
  school_id UUID,
  avatar_url TEXT,
  coins INTEGER NOT NULL DEFAULT 0,
  spent_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pokemon_collections table to store student's pokemon
CREATE TABLE public.pokemon_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  pokemon_id TEXT NOT NULL,
  pokemon_name TEXT NOT NULL,
  pokemon_image TEXT,
  pokemon_type TEXT,
  pokemon_rarity TEXT CHECK (pokemon_rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  pokemon_level INTEGER DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pokemon_pools table for school pokemon management
CREATE TABLE public.pokemon_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id TEXT NOT NULL,
  pokemon_id TEXT NOT NULL,
  pokemon_name TEXT NOT NULL,
  pokemon_image TEXT,
  pokemon_type TEXT,
  pokemon_rarity TEXT CHECK (pokemon_rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  pokemon_level INTEGER DEFAULT 1,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mystery_ball_history table to track mystery ball attempts
CREATE TABLE public.mystery_ball_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  result_type TEXT CHECK (result_type IN ('pokemon', 'coins', 'nothing')) NOT NULL,
  pokemon_id TEXT,
  pokemon_name TEXT,
  coins_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_attempts table to track free daily mystery ball attempts
CREATE TABLE public.daily_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  used BOOLEAN DEFAULT FALSE,
  UNIQUE(student_id, attempt_date)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_ball_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_profiles
CREATE POLICY "Students can view their own profile" 
  ON public.student_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile" 
  ON public.student_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for pokemon_collections
CREATE POLICY "Students can view their own pokemon" 
  ON public.pokemon_collections 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can manage their own pokemon" 
  ON public.pokemon_collections 
  FOR ALL 
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

-- Create RLS policies for pokemon_pools (teachers and students can view)
CREATE POLICY "Users can view pokemon pools" 
  ON public.pokemon_pools 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage pokemon pools" 
  ON public.pokemon_pools 
  FOR ALL 
  TO authenticated
  USING (true);

-- Create RLS policies for mystery_ball_history
CREATE POLICY "Students can view their own history" 
  ON public.mystery_ball_history 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert their own history" 
  ON public.mystery_ball_history 
  FOR INSERT 
  WITH CHECK (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

-- Create RLS policies for daily_attempts
CREATE POLICY "Students can manage their own attempts" 
  ON public.daily_attempts 
  FOR ALL 
  USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX idx_student_profiles_username ON public.student_profiles(username);
CREATE INDEX idx_pokemon_collections_student_id ON public.pokemon_collections(student_id);
CREATE INDEX idx_pokemon_pools_school_id ON public.pokemon_pools(school_id);
CREATE INDEX idx_mystery_ball_history_student_id ON public.mystery_ball_history(student_id);
CREATE INDEX idx_daily_attempts_student_date ON public.daily_attempts(student_id, attempt_date);
