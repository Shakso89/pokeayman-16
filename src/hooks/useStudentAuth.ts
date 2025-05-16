import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Student {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  photos?: string[]; 
  classId?: string;
  pokemonCollection?: { id: string; name: string; image: string }[];
  contactInfo?: string;
}

interface StudentAuthResult {
  student: Student | null;
  isLoading: boolean;
  isEditing: boolean;
  editData: Partial<Student>;
  isOwner: boolean;
  friendRequestSent: boolean;
  setEditData: (data: Partial<Student>) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleSendMessage: () => void;
  handleAddFriend: () => void;
}

export const useStudentProfile = (studentId: string | undefined): StudentAuthResult => {
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
      // Try to get student from localStorage
      const studentsData = localStorage.getItem("students");
      if (studentsData) {
        const students = JSON.parse(studentsData);
        const foundStudent = students.find((s: Student) => s.id === studentId);
        
        if (foundStudent) {
          // Get Pokémon collection
          const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
          const pokemonData = studentPokemons.find((p: any) => p.studentId === studentId);
          
          setStudent({
            ...foundStudent,
            photos: foundStudent.photos || [], // Ensure photos is an array
            pokemonCollection: pokemonData?.pokemons || []
          });
          
          setEditData({
            displayName: foundStudent.displayName,
            photos: foundStudent.photos || [],
            contactInfo: foundStudent.contactInfo
          });
        } else {
          toast("Student not found");
        }
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
      toast("Error loading profile");
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
  
  const handleSave = () => {
    if (!student) return;
    
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const index = students.findIndex((s: Student) => s.id === studentId);
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          displayName: editData.displayName || student.displayName,
          contactInfo: editData.contactInfo,
          photos: editData.photos || student.photos,
          avatar: student.avatar
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        
        setStudent({
          ...student,
          displayName: editData.displayName || student.displayName,
          contactInfo: editData.contactInfo,
          photos: editData.photos || student.photos
        });
        
        setIsEditing(false);
        toast("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast("Failed to save profile");
    }
  };
  
  const handleCancel = () => {
    setEditData({
      displayName: student?.displayName,
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
      displayName: student.displayName,
      avatar: student.avatar
    }));
    
    toast("Message window opened");
  };
  
  const handleAddFriend = () => {
    if (!student || !currentUserId) return;
    
    // Check if request already sent
    if (friendRequestSent) {
      toast("Friend request already sent");
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
    
    // Save to localStorage
    const requests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    requests.push(newRequest);
    localStorage.setItem("friendRequests", JSON.stringify(requests));
    
    setFriendRequestSent(true);
    toast("Friend request sent");
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
