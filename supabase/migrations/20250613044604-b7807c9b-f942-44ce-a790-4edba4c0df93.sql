
-- Add assistants column to classes table
ALTER TABLE public.classes 
ADD COLUMN assistants text[] DEFAULT '{}';

-- Update existing classes to have empty assistants array if null
UPDATE public.classes 
SET assistants = '{}' 
WHERE assistants IS NULL;
