
-- 1. Limit school pool to 300 Pokémon on initialization

-- Update initialization function if needed, but just for reference here is how a pool of 300 Pokémon would be set up:
-- All logic here is so new schools get only 300 unique pokémon in their pool.
-- (You should update any initialization logic in the backend to only insert 300.)

-- 2. Refactor pool so that pokémons are never removed/depleted, just serve as a catalog.

-- Drop 'status', 'assigned_to_student_id', and 'assigned_at' columns since we no longer track assignment
ALTER TABLE public.pokemon_pools
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS assigned_to_student_id,
  DROP COLUMN IF EXISTS assigned_at;

-- 3. Remove unique/assignment requirements
-- No further unique/assignment enforcement is needed.
-- No additional constraints to drop.

-- 4. Update pokemon_collections to NOT require a "pool_entry_id"

ALTER TABLE public.pokemon_collections
  DROP COLUMN IF EXISTS pool_entry_id;

-- 5. (Optional) Remove logic that checks pool 'available' status, etc (handled in code refactor).

-- 6. (Optional) Clean up old policies

-- All RLS policies remain fine since awards still require authentication.

-- 7. Future-proofing (Document for backend): Insert to 'pokemon_collections' when copying from pool
-- When a teacher awards a Pokémon, simply insert into 'pokemon_collections' with the chosen pokemon_id and student_id.

-- The updated schema allows any number of students to collect the same Pokémon from the school pool. The teacher can still see which pokémon are available per school, limited to 300. Assignment is now a simple insert and is "copy"-based, not unique/depleting.

