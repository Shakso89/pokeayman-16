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
          photos: [],
          classes: [],
          socialLinks: {}
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
        socialLinks: foundTeacher.socialLinks || {}
      };

      setTeacher(teacherData);
      setEditData(teacherData);

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

  const handleSave = () => {
    if (!teacher) return;

    try {
      const teachers = getLocalItem("teachers", []);
      const index = teachers.findIndex((t: any) => t.id === teacherId);
      if (index === -1) return;

      const updatedTeacher = {
        ...teachers[index],
        displayName: editData.displayName || teacher.displayName,
        avatar: editData.avatar || teacher.avatar,
        photos: editData.photos || teacher.photos,
        socialLinks: editData.socialLinks || teacher.socialLinks
      };

      teachers[index] = updatedTeacher;
      localStorage.setItem("teachers", JSON.stringify(teachers));
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
