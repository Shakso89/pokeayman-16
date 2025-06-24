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
      // Fetch from students table with school join
      const { data: studentData, error: dbError } = await supabase
        .from('students')
        .select(`
          id,
          username,
          display_name,
          profile_photo,
          class_id,
          school_id,
          schools:school_id (
            id,
            name
          )
        `)
        .eq('id', studentId)
        .maybeSingle();

      if (dbError) {
        console.error("Error fetching student profile from DB:", dbError.message);
        setError(`Failed to load profile: ${dbError.message}`);
        setStudent(null);
        return;
      }

      if (studentData) {
        // Properly extract school name from the schools relation
        const schoolName = studentData.schools && typeof studentData.schools === 'object' && !Array.isArray(studentData.schools) 
          ? (studentData.schools as { name: string }).name 
          : "No School Assigned";
          
        const normalizedStudent: Student = {
          id: studentData.id,
          username: studentData.username,
          displayName: studentData.display_name || studentData.username,
          avatarUrl: studentData.profile_photo || undefined,
          classId: studentData.class_id || undefined,
          schoolId: studentData.school_id || undefined,
          schoolName: schoolName,
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

        // Optional: If you *must* sync session data for the current user
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
      console.error("Unexpected error fetching student data:", err.message);
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
      const { data, error } = await supabase
        .from('student_pokemon_collection')
        .select(`
          pokemon_pool(id, name, image_url)
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error("Error fetching student pokemon:", error.message);
      } else {
        const pokemons = data?.map((item: any) => ({
          id: item.pokemon_pool.id,
          name: item.pokemon_pool.name,
          imageUrl: item.pokemon_pool.image_url,
        })) || [];
        setStudent(prev => prev ? { ...prev, pokemonCollection: pokemons } : null);
      }
    } catch (err) {
      console.error("Unexpected error fetching pokemon:", err);
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
      const updates: any = {};
      if (editData.displayName !== student.displayName) {
        updates.display_name = editData.displayName;
      }

      const { error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId);

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
