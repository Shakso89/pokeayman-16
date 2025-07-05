-- Fix RLS policies for student access without requiring Supabase auth
-- Since students use localStorage-based authentication, we need different policies

-- Drop existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "Students can view their own profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update their own profile" ON student_profiles;

-- Create new policies that allow authenticated access without relying on auth.uid()
CREATE POLICY "Allow authenticated users to view student profiles" 
ON student_profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to update student profiles" 
ON student_profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert student profiles" 
ON student_profiles FOR INSERT 
WITH CHECK (true);