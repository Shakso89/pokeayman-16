
-- First, let's create the proper enum types and update existing tables to match your architecture

-- Create or update the app_role enum to include all roles
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('student', 'teacher', 'senior_teacher', 'manager', 'owner');

-- Update teachers table to align with Users concept
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS profile_photo text,
ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0;

-- Update students table to align with Users concept  
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS profile_photo text,
ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false;

-- Create ClassMembership table to replace the current array-based approach
CREATE TABLE IF NOT EXISTS public.class_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_in_class text NOT NULL CHECK (role_in_class IN ('student', 'assistant', 'lead')),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(class_id, user_id)
);

-- Update SchoolPokemonPool to match your architecture
ALTER TABLE public.pokemon_pools
ADD COLUMN IF NOT EXISTS is_assigned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS assigned_to uuid,
ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone;

-- Create CoinHistory table for tracking coin changes
CREATE TABLE IF NOT EXISTS public.coin_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  change_amount integer NOT NULL,
  reason text NOT NULL,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Update homework table to include reward coins
ALTER TABLE public.homework
ADD COLUMN IF NOT EXISTS reward_coins integer DEFAULT 0;

-- Update homework_submissions to include approval fields
ALTER TABLE public.homework_submissions
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Enable RLS on new tables
ALTER TABLE public.class_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_history ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow all operations on class_membership" 
  ON public.class_membership 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on coin_history" 
  ON public.coin_history 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_membership_class_id ON public.class_membership(class_id);
CREATE INDEX IF NOT EXISTS idx_class_membership_user_id ON public.class_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_history_user_id ON public.coin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_pools_school_assigned ON public.pokemon_pools(school_id, is_assigned);
