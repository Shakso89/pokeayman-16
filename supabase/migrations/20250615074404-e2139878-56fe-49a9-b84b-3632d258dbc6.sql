
-- Drop the incorrect foreign key constraint if it exists
ALTER TABLE public.student_classes
DROP CONSTRAINT IF EXISTS student_classes_student_id_fkey;

-- Add the correct foreign key constraint referencing the 'students' table
ALTER TABLE public.student_classes
ADD CONSTRAINT student_classes_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES public.students(id)
ON DELETE CASCADE;
