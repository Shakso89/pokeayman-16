
import { supabase } from "@/integrations/supabase/client";

export interface StudentProfileData {
  user_id: string;
  username: string;
  display_name?: string;
  school_id?: string;
  teacher_id?: string;
  class_id?: string;
}

// Create a student profile that references the students table instead of auth.users
export const ensureStudentProfile = async (profileData: StudentProfileData): Promise<string | null> => {
  try {
    console.log(`Ensuring profile exists for student: ${profileData.user_id}`);
    
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', profileData.user_id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing profile:', fetchError);
    }

    if (existingProfile) {
      console.log(`Student profile already exists: ${existingProfile.id}`);
      return existingProfile.id;
    }

    console.log(`Creating new profile for student: ${profileData.user_id}`);
    
    // Create new profile with all required fields
    const newProfileData = {
      user_id: profileData.user_id,
      username: profileData.username || `student_${profileData.user_id.slice(0, 8)}`,
      display_name: profileData.display_name || profileData.username || `Student ${profileData.user_id.slice(0, 8)}`,
      school_id: profileData.school_id || null,
      teacher_id: profileData.teacher_id || null,
      class_id: profileData.class_id || null,
      coins: 0,
      spent_coins: 0
    };

    const { data: newProfile, error: createError } = await supabase
      .from('student_profiles')
      .insert(newProfileData)
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating student profile:', createError);
      
      // If creation fails due to duplicate, try to fetch again
      if (createError.code === '23505') { // Unique violation
        const { data: retryProfile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('user_id', profileData.user_id)
          .maybeSingle();
        
        if (retryProfile) {
          console.log(`Found existing profile after conflict: ${retryProfile.id}`);
          return retryProfile.id;
        }
      }
      
      return null;
    }

    console.log(`Successfully created student profile: ${newProfile.id}`);
    return newProfile.id;
  } catch (error) {
    console.error('Error in ensureStudentProfile:', error);
    return null;
  }
};

// Create student profile with basic info when we only have student ID
export const createBasicStudentProfile = async (userId: string): Promise<string | null> => {
  try {
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      console.log(`Profile already exists for student: ${userId}`);
      return existingProfile.id;
    }

    // Try to get student data from students table first
    const { data: studentData } = await supabase
      .from('students')
      .select('username, display_name, school_id, teacher_id, class_id')
      .eq('id', userId)
      .maybeSingle();

    if (!studentData) {
      console.log(`No student found with ID: ${userId}, creating basic profile`);
      // Create a minimal profile if student doesn't exist in students table
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: userId,
          username: `student_${userId.slice(0, 8)}`,
          display_name: `Student ${userId.slice(0, 8)}`,
          coins: 0,
          spent_coins: 0
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating basic profile:', createError);
        return null;
      }

      return newProfile.id;
    }

    const profileData: StudentProfileData = {
      user_id: userId,
      username: studentData.username || `student_${userId.slice(0, 8)}`,
      display_name: studentData.display_name || studentData.username || `Student ${userId.slice(0, 8)}`,
      school_id: studentData.school_id,
      teacher_id: studentData.teacher_id,
      class_id: studentData.class_id
    };

    return await ensureStudentProfile(profileData);
  } catch (error) {
    console.error('Error creating basic student profile:', error);
    return null;
  }
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

// Award coins to student (independent of class/school)
export const awardCoinsToStudentProfile = async (studentId: string, amount: number): Promise<boolean> => {
  try {
    console.log(`Awarding ${amount} coins to student: ${studentId}`);
    
    // Ensure profile exists first
    const profileId = await createBasicStudentProfile(studentId);
    if (!profileId) {
      console.error('Failed to ensure student profile exists for coins');
      return false;
    }

    // Get current coins
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    if (fetchError) {
      console.error('Error fetching current coins:', fetchError);
      return false;
    }

    const currentCoins = profile?.coins || 0;
    const newCoins = currentCoins + amount;

    // Update coins
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newCoins })
      .eq('user_id', studentId);

    if (updateError) {
      console.error('Error updating coins:', updateError);
      return false;
    }

    console.log(`Successfully awarded ${amount} coins. New balance: ${newCoins}`);
    return true;
  } catch (error) {
    console.error('Error awarding coins:', error);
    return false;
  }
};

// Remove coins from student (for purchases, etc.)
export const deductCoinsFromStudentProfile = async (studentId: string, amount: number): Promise<boolean> => {
  try {
    console.log(`Deducting ${amount} coins from student: ${studentId}`);
    
    // Get current coins
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    if (fetchError) {
      console.error('Error fetching current coins:', fetchError);
      return false;
    }

    const currentCoins = profile?.coins || 0;
    const currentSpentCoins = profile?.spent_coins || 0;
    
    if (currentCoins < amount) {
      console.error('Insufficient coins for deduction');
      return false;
    }

    const newCoins = currentCoins - amount;
    const newSpentCoins = currentSpentCoins + amount;

    // Update coins and spent coins
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newCoins,
        spent_coins: newSpentCoins
      })
      .eq('user_id', studentId);

    if (updateError) {
      console.error('Error deducting coins:', updateError);
      return false;
    }

    console.log(`Successfully deducted ${amount} coins. New balance: ${newCoins}`);
    return true;
  } catch (error) {
    console.error('Error deducting coins:', error);
    return false;
  }
};

// Bulk create student profiles for all students in the database
export const createAllStudentProfiles = async (): Promise<{ success: number; failed: number }> => {
  try {
    console.log('Starting bulk creation of student profiles...');
    
    // Get all students from the students table
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select('id, username, display_name, school_id, teacher_id, class_id');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return { success: 0, failed: 0 };
    }

    if (!allStudents || allStudents.length === 0) {
      console.log('No students found in database');
      return { success: 0, failed: 0 };
    }

    console.log(`Found ${allStudents.length} students, creating profiles...`);

    let successCount = 0;
    let failedCount = 0;

    // Create profiles one by one to handle individual failures
    for (const student of allStudents) {
      const profileData: StudentProfileData = {
        user_id: student.id,
        username: student.username || `student_${student.id.slice(0, 8)}`,
        display_name: student.display_name || student.username || `Student ${student.id.slice(0, 8)}`,
        school_id: student.school_id,
        teacher_id: student.teacher_id,
        class_id: student.class_id
      };

      const profileId = await ensureStudentProfile(profileData);
      if (profileId) {
        successCount++;
      } else {
        failedCount++;
        console.error(`Failed to create profile for student: ${student.id}`);
      }
    }

    console.log(`Bulk profile creation completed: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error in bulk profile creation:', error);
    return { success: 0, failed: 0 };
  }
};
