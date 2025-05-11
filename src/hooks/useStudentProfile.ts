
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface StudentProfile {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  photos: string[];
  classId?: string;
  pokemonCollection?: { id: string; name: string; image: string }[];
  contactInfo?: string;
}

export const useStudentProfile = (studentId: string | undefined) => {
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  // Check if current user is the owner of this profile
  const currentUserId = localStorage.getItem("studentId");
  const isOwner = currentUserId === studentId;
  
  const loadStudentProfile = () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const foundStudent = students.find((s: any) => s.id === studentId);
      
      if (foundStudent) {
        // Ensure photos array exists
        const studentData = {
          ...foundStudent,
          photos: foundStudent.photos || [],
          pokemonCollection: foundStudent.pokemonCollection || []
        };
        
        setStudent(studentData);
        setEditData(studentData);
      } else {
        toast.error("Student not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendRequestStatus = () => {
    if (!studentId || !currentUserId) return;
    
    // Check if friend request exists in localStorage
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const existingRequest = friendRequests.find(
      (request: any) => 
        (request.senderId === currentUserId && request.receiverId === studentId) ||
        (request.senderId === studentId && request.receiverId === currentUserId)
    );
    
    if (existingRequest) {
      setFriendRequestSent(true);
    }
  };
  
  const handleSave = () => {
    if (!student) return;
    
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const index = students.findIndex((s: any) => s.id === studentId);
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          displayName: editData.displayName || student.displayName,
          avatar: editData.avatar || student.avatar,
          photos: editData.photos || student.photos,
          contactInfo: editData.contactInfo
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        setStudent({...student, ...editData});
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };
  
  const handleCancel = () => {
    setEditData(student || {});
    setIsEditing(false);
  };
  
  const handleSendMessage = () => {
    if (!student) return;
    
    // Store the selected contact in localStorage
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
    
    // Navigate to messages page
    navigate("/student/messages");
  };
  
  const handleAddFriend = () => {
    if (!student || !currentUserId) return;
    
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("studentName") || localStorage.getItem("teacherUsername") || "";
    
    // Create a friend request object
    const friendRequest = {
      id: `fr-${Date.now()}`,
      senderId: currentUserId,
      senderType: userType,
      senderName: userName,
      receiverId: student.id,
      receiverType: "student",
      receiverName: student.displayName,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    friendRequests.push(friendRequest);
    localStorage.setItem("friendRequests", JSON.stringify(friendRequests));
    
    // Update UI
    setFriendRequestSent(true);
    toast.success("Friend request sent");
  };

  useEffect(() => {
    if (studentId) {
      loadStudentProfile();
      // Check if friend request was already sent
      checkFriendRequestStatus();
    }
  }, [studentId]);

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
