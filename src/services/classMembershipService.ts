
import { supabase } from "@/integrations/supabase/client";
import { ClassMembership } from "@/types/user";

// Add user to class
export const addUserToClass = async (
  classId: string, 
  userId: string, 
  roleInClass: 'student' | 'assistant' | 'lead' = 'student'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('class_membership')
      .insert({
        class_id: classId,
        user_id: userId,
        role_in_class: roleInClass
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Error adding user to class:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding user to class:', error);
    return false;
  }
};

// Remove user from class
export const removeUserFromClass = async (classId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('class_membership')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing user from class:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing user from class:', error);
    return false;
  }
};

// Get class members
export const getClassMembers = async (classId: string): Promise<ClassMembership[]> => {
  try {
    const { data, error } = await supabase
      .from('class_membership')
      .select('*')
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching class members:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      classId: item.class_id,
      userId: item.user_id,
      roleInClass: item.role_in_class as 'student' | 'assistant' | 'lead',
      joinedAt: item.joined_at
    }));
  } catch (error) {
    console.error('Error fetching class members:', error);
    return [];
  }
};

// Get user's class memberships
export const getUserClasses = async (userId: string): Promise<ClassMembership[]> => {
  try {
    const { data, error } = await supabase
      .from('class_membership')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user classes:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      classId: item.class_id,
      userId: item.user_id,
      roleInClass: item.role_in_class as 'student' | 'assistant' | 'lead',
      joinedAt: item.joined_at
    }));
  } catch (error) {
    console.error('Error fetching user classes:', error);
    return [];
  }
};

// Update user role in class
export const updateUserRoleInClass = async (
  classId: string,
  userId: string,
  newRole: 'student' | 'assistant' | 'lead'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('class_membership')
      .update({ role_in_class: newRole })
      .eq('class_id', classId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user role in class:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user role in class:', error);
    return false;
  }
};
