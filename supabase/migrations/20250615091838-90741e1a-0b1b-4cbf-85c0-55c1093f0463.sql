
-- This policy allows authenticated users (like teachers) to add pokemon to a student's collection.
CREATE POLICY "Allow authenticated users to insert into pokemon_collections"
ON public.pokemon_collections
FOR INSERT
TO authenticated
WITH CHECK (true);

-- This policy allows authenticated users to view all pokemon collections.
-- This is needed for teachers to manage student pokemon, as the existing policy only allows students to see their own.
CREATE POLICY "Allow authenticated users to view pokemon_collections"
ON public.pokemon_collections
FOR SELECT
TO authenticated
USING (true);

-- This policy allows authenticated users to delete from pokemon collections.
-- This is needed when a teacher removes a pokemon from a student.
CREATE POLICY "Allow authenticated users to delete from pokemon_collections"
ON public.pokemon_collections
FOR DELETE
TO authenticated
USING (true);
