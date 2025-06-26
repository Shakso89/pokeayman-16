
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define Student interface
export interface Student {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  classId?: string;
  schoolId?: string;
  schoolName?: string;
  contactInfo?: string;
  photos: string[];
  pokemonCollection: any[];
}

export const useStudentProfile = (studentId: string | undefined) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const userType = localStorage.getItem("userType");
  const currentUserId = userType === "teacher" ?
    localStorage.getItem("teacherId") :
    localStorage.getItem("studentId");

  const isOwner = userType === "student" && currentUserId === studentId;

  // Helper function to resolve student ID
  const resolveStudentId = async (inputId: string): Promise<string | null> => {
    if (!inputId) return null;
    
    // If it looks like a UUID, return as is
    if (inputId.includes('-') && inputId.length > 30) {
      return inputId;
    }

    // Try to find by username in students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id, user_id, username')
      .eq('username', inputId)
      .single();
    
    if (studentData && !studentError) {
      return studentData.user_id || studentData.id;
    }

    return inputId; // fallback
  };

  // --- Fetching Student Data ---
  const fetchStudentData = useCallback(async () => {
    if (!studentId) {
      setIsLoading(false);
      setError("Student ID is undefined.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching student profile for ID:", studentId);

      // First resolve the student ID
      const resolvedId = await resolveStudentId(studentId);
      if (!resolvedId) {
        setError("Could not resolve student ID");
        return;
      }

      console.log("Resolved student ID:", resolvedId);

      // Try students table first (with resolved ID)
      const { data: studentData, error: dbError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          username,
          display_name,
          profile_photo,
          class_id,
          school_id,
          school_name
        `)
        .eq('user_id', resolvedId)
        .maybeSingle();

      if (dbError) {
        console.error("Error fetching from students table:", dbError);
        // Try by ID as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('students')
          .select(`
            id,
            user_id,
            username,
            display_name,
            profile_photo,
            class_id,
            school_id,
            school_name
          `)
          .eq('id', resolvedId)
          .maybeSingle();

        if (fallbackError || !fallbackData) {
          console.error("Error in fallback query:", fallbackError);
          setError(`Failed to load profile: ${fallbackError?.message || 'Student not found'}`);
          return;
        }
        
        // Use fallback data
        const normalizedStudent: Student = {
          id: fallbackData.user_id || fallbackData.id,
          username: fallbackData.username,
          displayName: fallbackData.display_name || fallbackData.username,
          avatarUrl: fallbackData.profile_photo || undefined,
          classId: fallbackData.class_id || undefined,
          schoolId: fallbackData.school_id || undefined,
          schoolName: fallbackData.school_name || "No School Assigned",
          contactInfo: undefined,
          photos: [],
          pokemonCollection: []
        };

        setStudent(normalizedStudent);
        setEditData({
          displayName: normalizedStudent.displayName,
          contactInfo: normalizedStudent.contactInfo,
          photos: normalizedStudent.photos
        });
        return;
      }

      if (studentData) {
        console.log("Student data found:", studentData);
        
        const normalizedStudent: Student = {
          id: studentData.user_id || studentData.id,
          username: studentData.username,
          displayName: studentData.display_name || studentData.username,
          avatarUrl: studentData.profile_photo || undefined,
          classId: studentData.class_id || undefined,
          schoolId: studentData.school_id || undefined,
          schoolName: studentData.school_name || "No School Assigned",
          contactInfo: undefined,
          photos: [],
          pokemonCollection: []
        };

        console.log("Normalized student data:", normalizedStudent);

        setStudent(normalizedStudent);
        setEditData({
          displayName: normalizedStudent.displayName,
          contactInfo: normalizedStudent.contactInfo,
          photos: normalizedStudent.photos
        });

        // Update session data if this is the current user
        if (isOwner) {
          localStorage.setItem("studentName", normalizedStudent.displayName);
          localStorage.setItem("studentDisplayName", normalizedStudent.displayName);
        }
      } else {
        setStudent(null);
        setError("Student not found.");
        toast.error("Student not found");
      }
    } catch (err: any) {
      console.error("Unexpected error fetching student data:", err);
      setError(`An unexpected error occurred: ${err.message}`);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, isOwner]);

  // --- Fetching Pokemon Collection (separate concern) ---
  const fetchStudentPokemon = useCallback(async () => {
    if (!studentId) return;
    try {
      console.log("Fetching Pokemon for student profile:", studentId);

      const resolvedId = await resolveStudentId(studentId);
      if (!resolvedId) return;

      // Use the unified pokemon service
      const { getStudentPokemonCollection } = await import('@/services/pokemonService');
      const collection = await getStudentPokemonCollection(resolvedId);

      const pokemons = collection?.map((item: any) => ({
        id: item.pokemon?.id || item.pokemon_id,
        name: item.pokemon?.name || `Pokemon #${item.pokemon_id}`,
        imageUrl: item.pokemon?.image_url || '/placeholder.svg',
      })) || [];

      console.log("Pokemon collection for profile:", pokemons);

      setStudent(prev => prev ? { ...prev, pokemonCollection: pokemons } : null);
    } catch (err) {
      console.error("Unexpected error fetching pokemon for profile:", err);
    }
  }, [studentId]);

  // --- Check Friendship Status ---
  const checkFriendshipStatus = useCallback(async () => {
    if (!currentUserId || !studentId) return;

    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const existingRequest = friendRequests.find(
      (request: any) =>
        request.senderId === currentUserId &&
        request.receiverId === studentId &&
        request.status === "pending"
    );
    setFriendRequestSent(!!existingRequest);
  }, [currentUserId, studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchStudentPokemon();
      checkFriendshipStatus();
    }
  }, [studentId, fetchStudentData, fetchStudentPokemon, checkFriendshipStatus]);

  // --- Save Handler ---
  const handleSave = useCallback(async () => {
    if (!student || !studentId) return;

    setIsSaving(true);
    setError(null);
    try {
      const resolvedId = await resolveStudentId(studentId);
      if (!resolvedId) {
        throw new Error("Could not resolve student ID for update");
      }

      const updates: any = {};
      if (editData.displayName !== student.displayName) {
        updates.display_name = editData.displayName;
      }

      const { error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('user_id', resolvedId);

      if (updateError) {
        console.error("Error updating student in Supabase:", updateError.message);
        throw updateError;
      }

      setStudent(prev => prev ? {
        ...prev,
        ...editData,
        displayName: editData.displayName || prev.displayName,
      } : null);

      setIsEditing(false);
      toast.success("Profile updated successfully!");

      if (isOwner && editData.displayName) {
        localStorage.setItem("studentName", editData.displayName);
        localStorage.setItem("studentDisplayName", editData.displayName);
      }

    } catch (err: any) {
      console.error("Error saving profile:", err.message);
      setError(`Failed to save profile: ${err.message}`);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }, [student, studentId, editData, isOwner]);

  const handleCancel = useCallback(() => {
    if (student) {
      setEditData({
        displayName: student.displayName,
        photos: student.photos,
        contactInfo: student.contactInfo
      });
    }
    setIsEditing(false);
  }, [student]);

  const handleSendMessage = useCallback(() => {
    if (!student) return;
    localStorage.setItem("selectedChatUser", JSON.stringify({
      id: student.id,
      displayName: student.displayName,
      avatar: student.avatarUrl
    }));
    toast.success("Message window opened");
  }, [student]);

  const handleAddFriend = useCallback(async () => {
    if (!student || !currentUserId) return;

    if (friendRequestSent) {
      toast.info("Friend request already sent");
      return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        recipient_id: student.id,
        content: 'Friend request',
        subject: 'Friend Request'
      });

      if (error) throw error;

      setFriendRequestSent(true);
      toast.success("Friend request sent!");

    } catch (err: any) {
      console.error("Error sending friend request:", err.message);
      setError(`Failed to send friend request: ${err.message}`);
      toast.error("Failed to send friend request");
    }
  }, [student, currentUserId, friendRequestSent]);

  return {
    student,
    isLoading,
    isSaving,
    error,
    isEditing,
    editData,
    isOwner,
    friendRequestSent,
    setEditData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleSendMessage,
    handleAddFriend
  };
};
