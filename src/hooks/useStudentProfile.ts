
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  username: string;
  displayName?: string;  // Keep for backwards compatibility
  display_name: string;  // Use this as the primary property name
  avatar?: string;
  photos?: string[]; 
  classId?: string;
  class_id?: string;
  pokemonCollection?: { id: string; name: string; image: string }[];
  contactInfo?: string;
}

export const useStudentProfile = (studentId: string | undefined) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  const userType = localStorage.getItem("userType");
  const currentUserId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  
  // Check if current user is the owner of this profile
  const isOwner = userType === "student" && localStorage.getItem("studentId") === studentId;
  
  useEffect(() => {
    if (studentId) {
      loadStudentData();
      checkFriendshipStatus();
    }
  }, [studentId]);
  
  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      console.log("Loading student data for ID:", studentId);
      
      // First try to get student from Supabase
      const { data: studentData, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();
      
      if (studentData) {
        console.log("Found student in Supabase:", studentData);
        // Found student in Supabase
        setStudent({
          id: studentData.id,
          username: studentData.username,
          display_name: studentData.display_name || studentData.username,
          displayName: studentData.display_name || studentData.username, // For backward compatibility
          class_id: studentData.class_id,
          classId: studentData.class_id, // For backward compatibility
          photos: [],
          pokemonCollection: []
        });
        
        setEditData({
          display_name: studentData.display_name || studentData.username,
          photos: [],
          contactInfo: ""
        });
        
        // Sync with localStorage for legacy support
        try {
          const studentsInStorage = JSON.parse(localStorage.getItem("students") || "[]");
          const existingIndex = studentsInStorage.findIndex((s: any) => s.id === studentId);
          
          if (existingIndex >= 0) {
            // Update local storage entry
            studentsInStorage[existingIndex] = {
              ...studentsInStorage[existingIndex],
              display_name: studentData.display_name,
              displayName: studentData.display_name,
              username: studentData.username,
              class_id: studentData.class_id,
              classId: studentData.class_id
            };
          } else {
            // Add to local storage
            studentsInStorage.push({
              id: studentData.id,
              username: studentData.username,
              display_name: studentData.display_name,
              displayName: studentData.display_name,
              class_id: studentData.class_id,
              classId: studentData.class_id
            });
          }
          
          localStorage.setItem("students", JSON.stringify(studentsInStorage));
        } catch (e) {
          console.error("Error syncing with localStorage:", e);
        }
        
        setIsLoading(false);
        return;
      }
      
      // If not found in Supabase, fall back to localStorage
      console.log("Student not found in Supabase, checking localStorage");
      const studentsData = localStorage.getItem("students");
      if (studentsData) {
        const students = JSON.parse(studentsData);
        const foundStudent = students.find((s: Student) => s.id === studentId);
        
        if (foundStudent) {
          console.log("Found student in localStorage:", foundStudent);
          // Get Pokémon collection
          const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
          const pokemonData = studentPokemons.find((p: any) => p.studentId === studentId);
          
          // Normalize the data structure to ensure display_name is consistent
          const normalizedStudent = {
            ...foundStudent,
            display_name: foundStudent.displayName || foundStudent.display_name || foundStudent.username,
            photos: foundStudent.photos || [],
            class_id: foundStudent.classId || foundStudent.class_id,
            pokemonCollection: pokemonData?.pokemons || []
          };
          
          setStudent(normalizedStudent);
          
          setEditData({
            display_name: normalizedStudent.display_name,
            photos: normalizedStudent.photos || [],
            contactInfo: normalizedStudent.contactInfo
          });
          
          // Try to sync this student to the database
          try {
            const { data, error } = await supabase
              .from('students')
              .insert({
                id: normalizedStudent.id,
                username: normalizedStudent.username,
                display_name: normalizedStudent.display_name,
                class_id: normalizedStudent.class_id,
                is_active: true,
                created_at: new Date().toISOString()
              })
              .select();
              
            if (error && !error.message.includes('duplicate key')) {
              console.error("Error syncing student to database:", error);
            } else if (data) {
              console.log("Synced student to database:", data[0].id);
            }
          } catch (err) {
            console.error("Error syncing student to database:", err);
          }
        } else {
          console.log("Student not found in localStorage either");
          toast.error("Student not found");
        }
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendshipStatus = () => {
    if (!currentUserId || !studentId) return;
    
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    
    // Check if there's a pending friend request
    const existingRequest = friendRequests.find(
      (request: any) => 
        request.senderId === currentUserId && 
        request.receiverId === studentId && 
        request.status === "pending"
    );
    
    setFriendRequestSent(!!existingRequest);
  };
  
  const handleSave = async () => {
    if (!student) return;
    
    try {
      console.log("Saving profile with data:", editData);
      
      // Try to update in Supabase first
      if (student.id) {
        console.log("Updating student in Supabase:", student.id);
        const { error } = await supabase
          .from('students')
          .update({
            display_name: editData.display_name || student.display_name
          })
          .eq('id', student.id);
          
        if (error) {
          console.error("Error updating student in Supabase:", error);
          throw error;
        } else {
          console.log("Successfully updated student in Supabase");
        }
      }
      
      // Also update in localStorage for backward compatibility
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const index = students.findIndex((s: Student) => s.id === studentId);
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          displayName: editData.display_name || student.display_name,
          display_name: editData.display_name || student.display_name,
          contactInfo: editData.contactInfo,
          photos: editData.photos || student.photos,
          avatar: student.avatar
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        console.log("Updated student in localStorage");
      }
      
      // Update localStorage session data if it's the current user
      if (isOwner) {
        localStorage.setItem("studentName", editData.display_name || student.display_name);
        localStorage.setItem("studentDisplayName", editData.display_name || student.display_name);
        console.log("Updated session data in localStorage");
      }
      
      // Update local state
      const updatedStudent = {
        ...student,
        display_name: editData.display_name || student.display_name,
        displayName: editData.display_name || student.display_name,
        contactInfo: editData.contactInfo,
        photos: editData.photos || student.photos
      };
      
      setStudent(updatedStudent);
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
  };
  
  const handleCancel = () => {
    setEditData({
      display_name: student?.display_name,
      photos: student?.photos || [],
      contactInfo: student?.contactInfo
    });
    setIsEditing(false);
  };
  
  const handleSendMessage = () => {
    if (!student) return;
    
    // In a real app, this would navigate to the messaging page
    // For now we'll just simulate it using localStorage
    localStorage.setItem("selectedChatUser", JSON.stringify({
      id: student.id,
      displayName: student.display_name,
      avatar: student.avatar
    }));
    
    toast.success("Message window opened");
  };
  
  const handleAddFriend = async () => {
    if (!student || !currentUserId) return;
    
    // Check if request already sent
    if (friendRequestSent) {
      toast.info("Friend request already sent");
      return;
    }
    
    // Create friend request
    const newRequest = {
      id: `fr-${Date.now()}`,
      senderId: currentUserId,
      senderType: userType,
      receiverId: student.id,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage for now
    const requests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    requests.push(newRequest);
    localStorage.setItem("friendRequests", JSON.stringify(requests));
    
    // In a production app, we would also store this in the database
    try {
      // This is a placeholder for future database implementation
      /*
      await supabase.from('friend_requests').insert({
        sender_id: currentUserId,
        sender_type: userType,
        receiver_id: student.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      */
    } catch (err) {
      console.error("Error saving friend request to database:", err);
      // Continue anyway since we saved to localStorage
    }
    
    setFriendRequestSent(true);
    toast.success("Friend request sent");
  };
  
  return {
    student,
    isLoading,
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
