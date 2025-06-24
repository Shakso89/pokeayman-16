import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TeacherProfile } from "@/types/teacher"; // Assuming this exists and has base properties

// ... (SocialLinks and TeacherProfileData interfaces as improved above) ...

// Remove getLocalItem helper, as localStorage will be phased out for primary data.

export function useTeacherProfile(teacherId?: string) {
  const [teacher, setTeacher] = useState<TeacherProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfileData>>({});
  const [studentCount, setStudentCount] = useState<number>(0); // Initialize with 0
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // New state for save operations
  const [error, setError] = useState<string | null>(null); // New state for errors
  const [friendRequestSent, setFriendRequestSent] = useState(false); // This should ideally be fetched from DB

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
    setError(null); // Clear previous errors

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
          social_links,
          // Include any other columns directly from the teachers table that are needed
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
        // Use 'or' for teacher_id OR if teacherId is in the 'assistants' array (JSONB column, assuming it stores an array of IDs)
        .or(`teacher_id.eq.${teacherId},assistants.cs.{${teacherId}}`); // Ensure 'assistants' is properly indexed if it's a large array

      if (classesError) {
        toast.error("Failed to load teacher's classes.");
        console.error("Error fetching classes:", classesError.message);
        // Do not return here, continue with partial data
      }

      // 3. Fetch Student Count
      // Optimized to count students directly from the 'students' table where teacher_id matches
      const { count: studentsCount, error: studentCountError } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacherId);

      if (studentCountError) {
        console.error("Error fetching student count:", studentCountError.message);
        // Continue, studentCount will remain 0
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
        socialLinks: (teacherData.social_links as SocialLinks | null) || undefined, // Type assertion for JSONB
      };

      setTeacher(normalizedTeacher);
      // Set editData initially to the full fetched profile
      setEditData(normalizedTeacher);
      setStudentCount(studentsCount || 0);

    } catch (err: any) {
      console.error("Unexpected error loading teacher profile:", err.message);
      setError(`An unexpected error occurred: ${err.message}`);
      setTeacher(null);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]); // Dependency array: Re-run if teacherId changes

  // --- Friend Request Status Check (Should be DB-based) ---
  const checkFriendRequestStatus = useCallback(async () => {
    if (!teacherId || !currentUserId) return;

    try {
      // IDEAL: Query your 'friend_requests' table in Supabase
      const { data: requests, error: reqError } = await supabase
        .from('friend_requests')
        .select('status')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${currentUserId})`)
        .limit(1); // Only need to know if one exists

      if (reqError) {
        console.error("Error checking friend request status:", reqError.message);
        setFriendRequestSent(false); // Assume no request if error
        return;
      }

      const hasPendingOrAcceptedRequest = requests?.some(
        req => req.status === "pending" || req.status === "accepted"
      );
      setFriendRequestSent(!!hasPendingOrAcceptedRequest);

    } catch (err: any) {
      console.error("Unexpected error checking friend request status:", err.message);
      setFriendRequestSent(false);
    }
    // Remove localStorage logic for friend requests if moving to DB
  }, [currentUserId, teacherId]);

  // --- Effects ---
  useEffect(() => {
    fetchTeacherProfile();
    checkFriendRequestStatus();
  }, [fetchTeacherProfile, checkFriendRequestStatus]); // Dependencies on memoized functions

  // --- Save Handler ---
  const handleSave = useCallback(async () => {
    if (!teacher || !teacherId) return;

    setIsSaving(true);
    setError(null);

    try {
      // Map camelCase editData back to snake_case for Supabase update
      const updates: { [key: string]: any } = {};
      if ('displayName' in editData && editData.displayName !== teacher.displayName) {
        updates.display_name = editData.displayName;
      }
      if ('avatarUrl' in editData && editData.avatarUrl !== teacher.avatarUrl) {
        updates.avatar_url = editData.avatarUrl;
      }
      if ('photos' in editData && JSON.stringify(editData.photos) !== JSON.stringify(teacher.photos)) { // Deep compare arrays
        updates.photos = editData.photos;
      }
      if ('socialLinks' in editData && JSON.stringify(editData.socialLinks) !== JSON.stringify(teacher.socialLinks)) { // Deep compare objects
        updates.social_links = editData.socialLinks;
      }
      // Add other fields you allow to be edited

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

      // Update local state directly from editData since the save was successful
      setTeacher(prev => prev ? { ...prev, ...editData } : null);

      if (isOwner && editData.displayName) {
        localStorage.setItem("teacherDisplayName", editData.displayName);
        // You might also update teacherUsername if you allow it to be edited
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
    // Reset editData to the current 'teacher' state when canceling
    if (teacher) {
      setEditData({
        displayName: teacher.displayName,
        avatarUrl: teacher.avatarUrl,
        photos: teacher.photos,
        socialLinks: teacher.socialLinks,
        // ... (reset other editable fields)
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
      const { data, error } = await supabase.from('friend_requests').insert({
        sender_id: currentUserId,
        receiver_id: teacherId,
        status: 'pending', // 'pending', 'accepted', 'rejected'
        // Consider adding sender_type if your friend_requests table requires it
      }).select().single();

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
    // This updates the 'editData' state for the form
    setEditData(prev => {
      const currentSocialLinks = prev.socialLinks || teacher?.socialLinks || {}; // Prioritize prev.socialLinks
      const updatedSocialLinks = {
        ...currentSocialLinks,
        [platform]: value
      };
      return {
        ...prev,
        socialLinks: updatedSocialLinks
      };
    });
  }, [teacher]); // Dependency on teacher to access its socialLinks if editData.socialLinks is null


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