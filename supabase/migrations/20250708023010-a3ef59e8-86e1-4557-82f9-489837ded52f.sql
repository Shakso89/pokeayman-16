-- Create school_pokemon_pools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_pokemon_pools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL,
  pokemon_id uuid NOT NULL,
  is_assigned boolean DEFAULT false,
  assigned_to uuid,
  assigned_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on school_pokemon_pools
ALTER TABLE public.school_pokemon_pools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for school_pokemon_pools
CREATE POLICY "Allow authenticated users to view school pokemon pools" 
ON public.school_pokemon_pools FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage school pokemon pools" 
ON public.school_pokemon_pools FOR ALL 
USING (true)
WITH CHECK (true);

-- Add foreign key constraint to pokemon_pool
ALTER TABLE public.school_pokemon_pools 
ADD CONSTRAINT fk_school_pokemon_pool_pokemon 
FOREIGN KEY (pokemon_id) REFERENCES public.pokemon_pool(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_school_pokemon_pools_school_id ON public.school_pokemon_pools(school_id);
CREATE INDEX IF NOT EXISTS idx_school_pokemon_pools_pokemon_id ON public.school_pokemon_pools(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_school_pokemon_pools_assigned_to ON public.school_pokemon_pools(assigned_to);

-- Update the foreign key relationship for the query joins
-- This helps Supabase understand the relationship for joins
COMMENT ON CONSTRAINT fk_school_pokemon_pool_pokemon ON public.school_pokemon_pools 
IS 'Foreign key to pokemon_pool for joining with pokemon data';