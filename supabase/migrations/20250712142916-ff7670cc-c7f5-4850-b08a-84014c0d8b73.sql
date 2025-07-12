-- Create a security definer function to add students to classes that bypasses RLS
CREATE OR REPLACE FUNCTION public.add_student_to_class(
  p_student_id UUID,
  p_class_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into student_classes join table (ignore if already exists)
  INSERT INTO public.student_classes (student_id, class_id)
  VALUES (p_student_id, p_class_id)
  ON CONFLICT (student_id, class_id) DO NOTHING;
  
  -- Update student's class_id in students table
  UPDATE public.students 
  SET class_id = p_class_id 
  WHERE id = p_student_id;
  
  -- Update student's class_id in student_profiles table
  UPDATE public.student_profiles 
  SET class_id = p_class_id 
  WHERE user_id = p_student_id OR id = p_student_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create function to remove student from class
CREATE OR REPLACE FUNCTION public.remove_student_from_class(
  p_student_id UUID,
  p_class_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove from student_classes join table
  DELETE FROM public.student_classes 
  WHERE student_id = p_student_id AND class_id = p_class_id;
  
  -- Clear student's class_id in students table
  UPDATE public.students 
  SET class_id = NULL 
  WHERE id = p_student_id;
  
  -- Clear student's class_id in student_profiles table
  UPDATE public.student_profiles 
  SET class_id = NULL 
  WHERE user_id = p_student_id OR id = p_student_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;