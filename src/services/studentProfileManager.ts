
import { supabase } from "@/integrations/supabase/client";

export interface StudentProfileData {
  user_id: string;
  username: string;
  display_name?: string;
  school_id?: string;
  teacher_id?: string;
  class_id?: string;
}

// Ensure student profile exists independently of teacher/school data
export const ensureStudentProfile = async (profileData: StudentProfileData): Promise<string | null> => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', profileData.user_id)
      .maybeSingle();

    if (existingProfile) {
      console.log(`Student profile already exists: ${existingProfile.id}`);
      return existingProfile.id;
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
      .from('student_profiles')
      .insert({
        user_id: profileData.user_id,
        username: profileData.username,
        display_name: profileData.display_name || profileData.username,
        school_id: profileData.school_id || null,
        teacher_id: profileData.teacher_id || null,
        class_id: profileData.class_id || null,
        coins: 0,
        spent_coins: 0
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating student profile:', error);
      return null;
    }

    console.log(`Created new student profile: ${newProfile.id}`);
    return newProfile.id;
  } catch (error) {
    console.error('Error in ensureStudentProfile:', error);
    return null;
  }
};

// Migrate student from legacy students table to student_profiles
export const migrateStudentToProfile = async (studentId: string): Promise<string | null> => {
  try {
    // Get student data from students table
    const { data: studentData } = await supabase
      .from('students')
      .select('id, username, display_name, school_id, teacher_id, class_id')
      .eq('id', studentId)
      .maybeSingle();

    if (!studentData) {
      console.error(`Student not found in students table: ${studentId}`);
      return null;
    }

    // Ensure profile exists
    const profileId = await ensureStudentProfile({
      user_id: studentData.id,
      username: studentData.username,
      display_name: studentData.display_name,
      school_id: studentData.school_id,
      teacher_id: studentData.teacher_id,
      class_id: studentData.class_id
    });

    return profileId;
  } catch (error) {
    console.error('Error migrating student to profile:', error);
    return null;
  }
};

// Create student profile when student is added to class
export const createStudentProfileFromClassAssignment = async (
  studentId: string,
  username: string,
  displayName: string,
  classId: string,
  schoolId: string,
  teacherId: string
): Promise<string | null> => {
  return await ensureStudentProfile({
    user_id: studentId,
    username,
    display_name: displayName,
    class_id: classId,
    school_id: schoolId,
    teacher_id: teacherId
  });
};

// Update student profile while preserving independent data
export const updateStudentProfile = async (
  studentId: string,
  updates: Partial<{
    display_name: string;
    class_id: string;
    school_id: string;
    teacher_id: string;
  }>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', studentId);

    if (error) {
      console.error('Error updating student profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateStudentProfile:', error);
    return false;
  }
};
