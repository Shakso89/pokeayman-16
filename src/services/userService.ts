
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, ClassMembership, CoinHistoryEntry } from "@/types/user";

// Get user by ID (works for both students and teachers)
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // First try teachers table
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (teacher) {
      return {
        id: teacher.id,
        username: teacher.username,
        role: teacher.role as UserRole,
        passwordHash: teacher.password,
        schoolId: teacher.school_id,
        profilePhoto: teacher.profile_photo,
        isFrozen: teacher.is_frozen || false,
        credits: teacher.credits || 0,
        createdAt: teacher.created_at,
        updatedAt: teacher.created_at
      };
    }

    // Then try students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (student) {
      return {
        id: student.id,
        username: student.username,
        role: 'student' as UserRole,
        schoolId: student.school_id,
        profilePhoto: student.profile_photo,
        isFrozen: student.is_frozen || false,
        credits: 0, // Students don't have credits
        createdAt: student.created_at,
        updatedAt: student.created_at
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Get users by school ID
export const getUsersBySchool = async (schoolId: string): Promise<User[]> => {
  try {
    const users: User[] = [];

    // Get teachers from school
    const { data: teachers } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId);

    if (teachers) {
      teachers.forEach(teacher => {
        users.push({
          id: teacher.id,
          username: teacher.username,
          role: teacher.role as UserRole,
          passwordHash: teacher.password,
          schoolId: teacher.school_id,
          profilePhoto: teacher.profile_photo,
          isFrozen: teacher.is_frozen || false,
          credits: teacher.credits || 0,
          createdAt: teacher.created_at,
          updatedAt: teacher.created_at
        });
      });
    }

    // Get students from school
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId);

    if (students) {
      students.forEach(student => {
        users.push({
          id: student.id,
          username: student.username,
          role: 'student' as UserRole,
          schoolId: student.school_id,
          profilePhoto: student.profile_photo,
          isFrozen: student.is_frozen || false,
          credits: 0,
          createdAt: student.created_at,
          updatedAt: student.created_at
        });
      });
    }

    return users;
  } catch (error) {
    console.error('Error fetching users by school:', error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    if (user.role === 'student') {
      const { error } = await supabase
        .from('students')
        .update({
          username: updates.username,
          profile_photo: updates.profilePhoto,
          is_frozen: updates.isFrozen
        })
        .eq('id', userId);
      
      return !error;
    } else {
      const { error } = await supabase
        .from('teachers')
        .update({
          username: updates.username,
          profile_photo: updates.profilePhoto,
          is_frozen: updates.isFrozen,
          credits: updates.credits,
          school_id: updates.schoolId
        })
        .eq('id', userId);
      
      return !error;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Freeze/unfreeze user
export const toggleUserFreeze = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    return await updateUserProfile(userId, { isFrozen: !user.isFrozen });
  } catch (error) {
    console.error('Error toggling user freeze:', error);
    return false;
  }
};
