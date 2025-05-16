
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeacherProfile } from "@/types/teacher";
import { toast } from "sonner";

export interface SocialLinks {
  line?: string;
  whatsapp?: string;
  instagram?: string;
  phone?: string;
}

export interface TeacherProfileData extends TeacherProfile {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  photos: string[];
  classes: string[];
  socialLinks?: SocialLinks;
}

export function useTeacherProfile(teacherId?: string) {
  const [teacher, setTeacher] = useState<TeacherProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfileData>>({});
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  // Check if current user is the owner of this profile
  const currentUserId = localStorage.getItem("teacherId");
  const isOwner = currentUserId === teacherId;
  
  useEffect(() => {
    if (teacherId) {
      loadTeacherProfile();
      checkFriendRequestStatus();
    }
  }, [teacherId]);
  
  const loadTeacherProfile = async () => {
    setIsLoading(true);
    
    try {
      // First try to get teacher from Supabase
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();
      
      if (data) {
        // Teacher found in Supabase
        const teacherData: TeacherProfileData = {
          id: data.id,
          teacherId: data.id,
          displayName: data.display_name || data.username,
          username: data.username,
          email: data.email || '',
          photos: [],
          classes: [],
          socialLinks: {}
        };
        
        setTeacher(teacherData);
        setEditData(teacherData);
        
        // Get number of students
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherId);
          
        setStudentCount(count || 0);
      } else {
        // Fallback to localStorage if not found in Supabase
        console.log("Teacher not found in Supabase, falling back to localStorage");
        
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const foundTeacher = teachers.find((t: any) => t.id === teacherId);
        
        if (foundTeacher) {
          // Ensure photos array exists
          const teacherData = {
            ...foundTeacher,
            teacherId: foundTeacher.id,
            photos: foundTeacher.photos || [],
            socialLinks: foundTeacher.socialLinks || {}
          };
          
          setTeacher(teacherData);
          setEditData(teacherData);
          
          // Count students
          const classes = JSON.parse(localStorage.getItem("classes") || "[]");
          const teacherClasses = classes.filter((c: any) => 
            foundTeacher.classes?.includes(c.id)
          );
          
          let totalStudents = 0;
          teacherClasses.forEach((cls: any) => {
            totalStudents += cls.students?.length || 0;
          });
          
          setStudentCount(totalStudents);
        } else {
          toast.error("Teacher not found");
        }
      }
    } catch (error) {
      console.error("Error loading teacher profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendRequestStatus = () => {
    if (!teacherId || !currentUserId) return;
    
    // Check if friend request exists in localStorage
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const existingRequest = friendRequests.find(
      (request: any) => 
        (request.senderId === currentUserId && request.receiverId === teacherId) ||
        (request.senderId === teacherId && request.receiverId === currentUserId)
    );
    
    if (existingRequest) {
      setFriendRequestSent(true);
    }
  };
  
  const handleSave = () => {
    if (!teacher) return;
    
    try {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const index = teachers.findIndex((t: any) => t.id === teacherId);
      
      if (index !== -1) {
        teachers[index] = {
          ...teachers[index],
          displayName: editData.displayName || teacher.displayName,
          avatar: editData.avatar || teacher.avatar,
          photos: editData.photos || teacher.photos,
          socialLinks: editData.socialLinks || teacher.socialLinks
        };
        
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // Update local state with new data
        setTeacher({
          ...teacher,
          displayName: editData.displayName || teacher.displayName,
          avatar: editData.avatar || teacher.avatar,
          photos: editData.photos || teacher.photos,
          socialLinks: editData.socialLinks || teacher.socialLinks
        });
        
        // If this is the current logged-in teacher, update their display name in localStorage
        if (isOwner) {
          localStorage.setItem("teacherDisplayName", editData.displayName || teacher.displayName);
        }
        
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };
  
  const handleCancel = () => {
    setEditData(teacher || {});
    setIsEditing(false);
  };
  
  const handleAddFriend = () => {
    if (!teacher || !currentUserId) return;
    
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("studentName") || localStorage.getItem("teacherDisplayName") || "";
    
    // Create a friend request object
    const friendRequest = {
      id: `fr-${Date.now()}`,
      senderId: currentUserId,
      senderType: userType,
      senderName: userName,
      receiverId: teacher.id,
      receiverType: "teacher",
      receiverName: teacher.displayName,
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
  
  const updateSocialLink = (network: keyof SocialLinks, value: string) => {
    setEditData({
      ...editData,
      socialLinks: {
        ...(editData.socialLinks || {}),
        [network]: value
      }
    });
  };
  
  return {
    teacher,
    isLoading,
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
    updateSocialLink
  };
}
