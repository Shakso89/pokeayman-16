
-- Add school_id column to the students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
