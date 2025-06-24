
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define interfaces
export interface SocialLinks {
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  line?: string;
}

export interface TeacherProfileData {
  id: string;
  displayName: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  photos: string[];
  classes: Array<{ id: string; name: string }>;
  socialLinks?: SocialLinks;
}

export function useTeacherProfile(teacherId?: string) {
  const [teacher, setTeacher] = useState<TeacherProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfileData>>({});
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const currentUserId = localStorage.getItem("teacherId");
  const isOwner = currentUserId === teacherId;

  // --- Data Fetching Logic ---
  const fetchTeacherProfile = useCallback(async () => {
    if (!teacherId) {
      setIsLoading(false);
      setError("Teacher ID is not provided.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Teacher Data
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select(`
          id,
          username,
          display_name,
          email,
          avatar_url,
          photos,
          social_links
        `)
        .eq("id", teacherId)
        .single();

      if (teacherError) {
        console.error("Error fetching teacher profile from DB:", teacherError.message);
        setError(`Failed to load teacher profile: ${teacherError.message}`);
        setTeacher(null);
        return;
      }

      if (!teacherData) {
        setError("Teacher not found.");
        setTeacher(null);
        toast.error("Teacher not found.");
        return;
      }

      // 2. Fetch Classes associated with this teacher
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name")
        .eq("teacher_id", teacherId);

      if (classesError) {
        toast.error("Failed to load teacher's classes.");
        console.error("Error fetching classes:", classesError.message);
      }

      // 3. Fetch Student Count
      const { count: studentsCount, error: studentCountError } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacherId);

      if (studentCountError) {
        console.error("Error fetching student count:", studentCountError.message);
      }

      // Consolidate data into TeacherProfileData format
      const normalizedTeacher: TeacherProfileData = {
        id: teacherData.id,
        displayName: teacherData.display_name || teacherData.username,
        username: teacherData.username,
        email: teacherData.email || undefined,
        avatarUrl: teacherData.avatar_url || undefined,
        photos: (teacherData.photos as string[] | null) || [],
        classes: classesData || [],
        socialLinks: (teacherData.social_links as SocialLinks | null) || undefined,
      };

      setTeacher(normalizedTeacher);
      setEditData(normalizedTeacher);
      setStudentCount(studentsCount || 0);

    } catch (err: any) {
      console.error("Unexpected error loading teacher profile:", err.message);
      setError(`An unexpected error occurred: ${err.message}`);
      setTeacher(null);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  // --- Friend Request Status Check ---
  const checkFriendRequestStatus = useCallback(async () => {
    if (!teacherId || !currentUserId) return;

    try {
      const { data: requests, error: reqError } = await supabase
        .from('messages')
        .select('id')
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${teacherId}),and(sender_id.eq.${teacherId},recipient_id.eq.${currentUserId})`)
        .eq('subject', 'Friend Request')
        .limit(1);

      if (reqError) {
        console.error("Error checking friend request status:", reqError.message);
        setFriendRequestSent(false);
        return;
      }

      setFriendRequestSent(!!requests && requests.length > 0);

    } catch (err: any) {
      console.error("Unexpected error checking friend request status:", err.message);
      setFriendRequestSent(false);
    }
  }, [currentUserId, teacherId]);

  // --- Effects ---
  useEffect(() => {
    fetchTeacherProfile();
    checkFriendRequestStatus();
  }, [fetchTeacherProfile, checkFriendRequestStatus]);

  // --- Save Handler ---
  const handleSave = useCallback(async () => {
    if (!teacher || !teacherId) return;

    setIsSaving(true);
    setError(null);

    try {
      const updates: { [key: string]: any } = {};
      if ('displayName' in editData && editData.displayName !== teacher.displayName) {
        updates.display_name = editData.displayName;
      }
      if ('avatarUrl' in editData && editData.avatarUrl !== teacher.avatarUrl) {
        updates.avatar_url = editData.avatarUrl;
      }
      if ('photos' in editData && JSON.stringify(editData.photos) !== JSON.stringify(teacher.photos)) {
        updates.photos = editData.photos;
      }
      if ('socialLinks' in editData && JSON.stringify(editData.socialLinks) !== JSON.stringify(teacher.socialLinks)) {
        updates.social_links = editData.socialLinks;
      }

      if (Object.keys(updates).length === 0) {
          toast.info("No changes to save.");
          setIsEditing(false);
          setIsSaving(false);
          return;
      }

      const { error: updateError } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', teacherId);

      if (updateError) {
        console.error('Error saving to Supabase:', updateError.message);
        throw updateError;
      }

      setTeacher(prev => prev ? { ...prev, ...editData } : null);

      if (isOwner && editData.displayName) {
        localStorage.setItem("teacherDisplayName", editData.displayName);
      }

      setIsEditing(false);
      toast.success("Profile updated successfully");

    } catch (err: any) {
      console.error("Error saving profile:", err.message);
      setError(`Failed to save profile changes: ${err.message}`);
      toast.error("Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  }, [teacher, teacherId, editData, isOwner]);

  const handleCancel = useCallback(() => {
    if (teacher) {
      setEditData({
        displayName: teacher.displayName,
        avatarUrl: teacher.avatarUrl,
        photos: teacher.photos,
        socialLinks: teacher.socialLinks,
      });
    }
    setIsEditing(false);
  }, [teacher]);

  const handleAddFriend = useCallback(async () => {
    if (!currentUserId || !teacherId) return;

    if (friendRequestSent) {
      toast.info("Friend request already sent or accepted.");
      return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        recipient_id: teacherId,
        content: 'Friend request',
        subject: 'Friend Request'
      });

      if (error) throw error;

      setFriendRequestSent(true);
      toast.success("Friend request sent!");

    } catch (err: any) {
      console.error("Error sending friend request to DB:", err.message);
      setError(`Failed to send friend request: ${err.message}`);
      toast.error("Failed to send friend request");
    }
  }, [currentUserId, teacherId, friendRequestSent]);

  const updateSocialLink = useCallback((platform: keyof SocialLinks, value: string) => {
    setEditData(prev => {
      const currentSocialLinks = prev.socialLinks || teacher?.socialLinks || {};
      const updatedSocialLinks = {
        ...currentSocialLinks,
        [platform]: value
      };
      return {
        ...prev,
        socialLinks: updatedSocialLinks
      };
    });
  }, [teacher]);

  return {
    teacher,
    isLoading,
    isSaving,
    error,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    isOwner,
    studentCount,
    friendRequestSent,
    handleSave,
    handleCancel,
    handleAddFriend,
    updateSocialLink,
  };
}
