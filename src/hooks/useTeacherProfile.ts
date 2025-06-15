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
  avatar_url?: string;
  photos: string[];
  classes: string[];
  socialLinks?: SocialLinks;
}

// Helper: get item from localStorage
const getLocalItem = <T = any>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function useTeacherProfile(teacherId?: string) {
  const [teacher, setTeacher] = useState<TeacherProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfileData>>({});
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

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
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", teacherId)
        .single();

      if (data) {
        const teacherData: TeacherProfileData = {
          id: data.id,
          teacherId: data.id,
          displayName: data.display_name || data.username,
          username: data.username,
          email: data.email || "",
          photos: (data.photos as string[]) || [],
          classes: [],
          socialLinks: (data.social_links as SocialLinks) || {},
          avatar_url: data.avatar_url || undefined,
        };

        setTeacher(teacherData);
        setEditData(teacherData);

        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("teacher_id", teacherId);

        setStudentCount(count || 0);
        return;
      }

      console.log("Teacher not found in Supabase, falling back to localStorage");
      const teachers = getLocalItem("teachers", []);
      const foundTeacher = teachers.find((t: any) => t.id === teacherId);

      if (!foundTeacher) {
        toast.error("Teacher not found");
        return;
      }

      const teacherData = {
        ...foundTeacher,
        teacherId: foundTeacher.id,
        photos: foundTeacher.photos || [],
        socialLinks: foundTeacher.socialLinks || {},
        avatar_url: foundTeacher.avatar_url,
      };

      setTeacher(teacherData as TeacherProfileData);
      setEditData(teacherData as TeacherProfileData);

      const classes = getLocalItem("classes", []);
      const teacherClasses = classes.filter((c: any) => foundTeacher.classes?.includes(c.id));
      const totalStudents = teacherClasses.reduce((acc: number, cls: any) => acc + (cls.students?.length || 0), 0);
      setStudentCount(totalStudents);

    } catch (error) {
      console.error("Error loading teacher profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  const checkFriendRequestStatus = () => {
    if (!teacherId || !currentUserId) return;

    const friendRequests = getLocalItem("friendRequests", []);
    const existingRequest = friendRequests.find(
      (req: any) =>
        (req.senderId === currentUserId && req.receiverId === teacherId) ||
        (req.senderId === teacherId && req.receiverId === currentUserId)
    );

    if (existingRequest) setFriendRequestSent(true);
  };

  const handleSave = async () => {
    if (!teacher || !teacherId) return;

    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          display_name: editData.displayName,
          avatar_url: editData.avatar_url,
          photos: editData.photos,
          social_links: editData.socialLinks,
        })
        .eq('id', teacherId);
      
      const updatedTeacher = { ...teacher, ...editData };

      if (error) {
        console.error('Error saving to Supabase:', error);
        // Fall back to localStorage
        const teachers = getLocalItem("teachers", []);
        const index = teachers.findIndex((t: any) => t.id === teacherId);
        if (index !== -1) {
          teachers[index] = { ...teachers[index], ...updatedTeacher };
          localStorage.setItem("teachers", JSON.stringify(teachers));
        }
      }

      setTeacher(updatedTeacher);

      if (isOwner) {
        localStorage.setItem("teacherDisplayName", updatedTeacher.displayName);
      }

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };

  const handleCancel = () => {
    setEditData(teacher || {});
    setIsEditing(false);
  };

  const handleAddFriend = async () => {
    if (!currentUserId || !teacherId) return;
    
    try {
      // Check if we're already friends or have a pending request
      if (friendRequestSent) {
        toast.info("Friend request already sent");
        return;
      }
      
      // Create a friend request
      const friendRequest = {
        id: crypto.randomUUID(),
        senderId: currentUserId,
        receiverId: teacherId,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      // Store in localStorage for demo
      const friendRequests = getLocalItem("friendRequests", []);
      friendRequests.push(friendRequest);
      localStorage.setItem("friendRequests", JSON.stringify(friendRequests));
      
      setFriendRequestSent(true);
      toast.success("Friend request sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    }
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    if (!teacher) return;
    
    const updatedSocialLinks = {
      ...(editData.socialLinks || teacher.socialLinks || {}),
      [platform]: value
    };
    
    setEditData({
      ...editData,
      socialLinks: updatedSocialLinks
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
