import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ... (Student interface as improved above) ...

export const useStudentProfile = (studentId: string | undefined) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // New state for save operations
  const [error, setError] = useState<string | null>(null); // New state for errors
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
    setError(null); // Clear previous errors
    try {
      // Always fetch from Supabase as primary source
      const { data: studentData, error: dbError } = await supabase
        .from('students')
        .select(`
          id,
          username,
          display_name,
          avatar_url, // Assuming avatar_url in DB
          class_id,
          school_id,
          contact_info, // Assuming contact_info in DB
          schools:school_id (
            id,
            name
          )
          // Select other columns you need like coins, etc.
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
        const schoolName = (studentData.schools as { name: string } | null)?.name || "No School Assigned";
        const normalizedStudent: Student = {
          id: studentData.id,
          username: studentData.username,
          displayName: studentData.display_name || studentData.username,
          avatarUrl: studentData.avatar_url || undefined,
          classId: studentData.class_id || undefined,
          schoolId: studentData.school_id || undefined,
          schoolName: schoolName,
          contactInfo: studentData.contact_info || undefined,
          photos: [], // You'll need a separate fetch for photos if they're in a different table/storage
          pokemonCollection: [] // You'll need a separate fetch for pokemon if they're in a different table
        };
        setStudent(normalizedStudent);
        setEditData({
          displayName: normalizedStudent.displayName,
          contactInfo: normalizedStudent.contactInfo,
          photos: normalizedStudent.photos
        });

        // Optional: If you *must* sync session data for the current user (e.g., for NavBar display)
        if (isOwner) {
            localStorage.setItem("studentName", normalizedStudent.displayName);
            localStorage.setItem("studentDisplayName", normalizedStudent.displayName);
            // You might want to update studentAvatarUrl, studentClassId etc. here too
        }

      } else {
        // If student not found in DB
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
  }, [studentId, isOwner]); // Include isOwner in dependency array

  // --- Fetching Pokemon Collection (separate concern) ---
  const fetchStudentPokemon = useCallback(async () => {
    if (!studentId) return;
    try {
      // Assuming 'pokemon_collections' has a 'student_id' and joins to 'pokemon_catalog'
      const { data, error } = await supabase
        .from('pokemon_collections')
        .select('pokemon_catalog(id, name, image_url)') // Select only necessary fields
        .eq('student_id', studentId);

      if (error) {
        console.error("Error fetching student pokemon:", error.message);
        // Optionally, set a specific error for pokemon collection
      } else {
        const pokemons = data?.map((item: any) => ({
          id: item.pokemon_catalog.id,
          name: item.pokemon_catalog.name,
          imageUrl: item.pokemon_catalog.image_url,
        })) || [];
        setStudent(prev => prev ? { ...prev, pokemonCollection: pokemons } : null);
      }
    } catch (err) {
      console.error("Unexpected error fetching pokemon:", err);
    }
  }, [studentId]);

  // --- Check Friendship Status (could also be fetched from DB) ---
  const checkFriendshipStatus = useCallback(async () => {
    if (!currentUserId || !studentId) return;

    // Ideally, this would be fetched from a 'friend_requests' table in Supabase
    // For now, keeping your localStorage implementation, but acknowledge its limitations
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
      fetchStudentPokemon(); // Fetch Pokémon separately
      checkFriendshipStatus();
    }
  }, [studentId, fetchStudentData, fetchStudentPokemon, checkFriendshipStatus]); // Add all dependencies

  // --- Save Handler ---
  const handleSave = useCallback(async () => {
    if (!student || !studentId) return; // Ensure studentId is available

    setIsSaving(true); // Set saving state
    setError(null);
    try {
      const updates: Partial<Student> = {
        display_name: editData.displayName // Map back to snake_case for DB
      };
      // Only update fields that are actually changed in editData
      if (editData.contactInfo !== student.contactInfo) updates.contact_info = editData.contactInfo; // Map back to snake_case
      // If photos are managed via Supabase storage, this logic would change
      // if (editData.photos !== student.photos) updates.photos = editData.photos;

      const { error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId);

      if (updateError) {
        console.error("Error updating student in Supabase:", updateError.message);
        throw updateError;
      }

      // Update local state based on what was saved to DB
      setStudent(prev => prev ? {
        ...prev,
        ...editData, // Update with editData fields
        // Ensure display_name also updates if displayName was changed
        displayName: editData.displayName || prev.displayName,
      } : null);

      setIsEditing(false);
      toast.success("Profile updated successfully!");

      // Update localStorage session data if it's the current user (for header, etc.)
      if (isOwner && editData.displayName) {
          localStorage.setItem("studentName", editData.displayName);
          localStorage.setItem("studentDisplayName", editData.displayName);
      }

    } catch (err: any) {
      console.error("Error saving profile:", err.message);
      setError(`Failed to save profile: ${err.message}`);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false); // Reset saving state
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

    // Ideally, send this to your Supabase 'friend_requests' table
    try {
      const { data, error } = await supabase.from('friend_requests').insert({
        sender_id: currentUserId,
        receiver_id: student.id,
        status: 'pending', // 'pending', 'accepted', 'rejected'
        // Add sender_type if necessary for your DB schema
      }).select().single();

      if (error) throw error;

      setFriendRequestSent(true);
      toast.success("Friend request sent!");

      // (Optional) Remove localStorage friendRequests logic if moving to DB
    } catch (err: any) {
      console.error("Error sending friend request:", err.message);
      setError(`Failed to send friend request: ${err.message}`);
      toast.error("Failed to send friend request");
    }
  }, [student, currentUserId, friendRequestSent]);

  return {
    student,
    isLoading,
    isSaving, // Expose isSaving state
    error, // Expose error state
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