
-- Create the pokemon_collections table without the foreign key constraint for now
CREATE TABLE IF NOT EXISTS public.pokemon_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  pokemon_id TEXT NOT NULL,
  pokemon_name TEXT,
  pokemon_image TEXT,
  pokemon_type TEXT,
  pokemon_rarity TEXT CHECK (pokemon_rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  pokemon_level INTEGER DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pokemon_catalog JSONB
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pokemon_collections_student_id ON public.pokemon_collections(student_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_collections_pokemon_id ON public.pokemon_collections(pokemon_id);

-- Enable Row Level Security
ALTER TABLE public.pokemon_collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Users can view pokemon collections" ON public.pokemon_collections;
DROP POLICY IF EXISTS "Users can manage pokemon collections" ON public.pokemon_collections;

-- Create RLS policies to allow authenticated users to manage collections
CREATE POLICY "Users can view pokemon collections" 
ON public.pokemon_collections 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can manage pokemon collections" 
ON public.pokemon_collections 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Add unique constraint to student_profiles.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'student_profiles_user_id_unique'
        AND table_name = 'student_profiles'
    ) THEN
        ALTER TABLE public.student_profiles 
        ADD CONSTRAINT student_profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Now add the foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pokemon_collections_student_id_fkey'
        AND table_name = 'pokemon_collections'
    ) THEN
        ALTER TABLE public.pokemon_collections 
        ADD CONSTRAINT pokemon_collections_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.student_profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;
