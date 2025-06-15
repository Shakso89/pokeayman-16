
-- This policy allows any authenticated user to add new pokemon to the pools.
-- This is needed for initializing school pokemon pools.
CREATE POLICY "Allow authenticated users to insert into pokemon_pools"
ON public.pokemon_pools
FOR INSERT
TO authenticated
WITH CHECK (true);

-- This policy allows any authenticated user to update pokemon pool entries.
-- This is needed when a student is assigned a pokemon.
CREATE POLICY "Allow authenticated users to update pokemon_pools"
ON public.pokemon_pools
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- This policy allows any authenticated user to delete from pokemon pools.
-- This is needed when refreshing the school pokemon pools.
CREATE POLICY "Allow authenticated users to delete from pokemon_pools"
ON public.pokemon_pools
FOR DELETE
TO authenticated
USING (true);
