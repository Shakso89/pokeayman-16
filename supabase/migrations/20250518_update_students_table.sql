
-- Modify the students table to replace password with password_hash
ALTER TABLE IF EXISTS public.students 
  RENAME COLUMN password TO password_hash;

-- Add uniqueness constraint to username
ALTER TABLE IF EXISTS public.students
  ADD CONSTRAINT students_username_unique UNIQUE (username);

-- Update any existing records to have hashed passwords
-- This is a temporary measure during migration and should be changed by users
UPDATE public.students SET password_hash = '$2a$10$eCugkKlBxL1CVqPczE76deYiIh5qHT/Hl9raZZfVVv5rLbecUCrKG' WHERE password_hash IS NOT NULL;
-- Note: Above is a bcrypt hash for 'password123' - users should change their passwords after migration
