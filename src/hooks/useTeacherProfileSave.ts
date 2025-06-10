import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TeacherProfileUpdate {
  display_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  photos?: string[];
}

export const useTeacherProfileSave = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveProfile = async (teacherId: string, profileData: TeacherProfileUpdate) => {
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID is required",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    try {
      // Update the teachers table with the new profile data
      const { error } = await supabase
        .from('teachers')
        .update({
          display_name: profileData.display_name,
          email: profileData.email,
          // Store additional profile data in a JSONB column if available
          // For now, we'll use the existing columns
        })
        .eq('id', teacherId);

      if (error) throw error;

      // Update localStorage to keep data in sync
      if (profileData.display_name) {
        localStorage.setItem('teacherDisplayName', profileData.display_name);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveProfile,
    isSaving
  };
};
