
-- Create RLS policies for student_pokemon_collection table to allow authenticated users to manage their collections

-- Policy to allow authenticated users to insert into their own Pokemon collection
CREATE POLICY "Students can add to their own Pokemon collection" 
  ON public.student_pokemon_collection 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Policy to allow authenticated users to view their own Pokemon collection
CREATE POLICY "Students can view their own Pokemon collection" 
  ON public.student_pokemon_collection 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = student_id);

-- Policy to allow authenticated users (like teachers) to view all Pokemon collections
CREATE POLICY "Allow authenticated users to view all Pokemon collections" 
  ON public.student_pokemon_collection 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to insert Pokemon for any student (for teachers awarding Pokemon)
CREATE POLICY "Allow authenticated users to award Pokemon to students" 
  ON public.student_pokemon_collection 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Policy to allow authenticated users to delete from Pokemon collections (for teachers removing Pokemon)
CREATE POLICY "Allow authenticated users to remove Pokemon from collections" 
  ON public.student_pokemon_collection 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Enable RLS on the table if not already enabled
ALTER TABLE public.student_pokemon_collection ENABLE ROW LEVEL SECURITY;
