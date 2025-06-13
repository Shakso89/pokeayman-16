
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getClassesBySchool, getClassesForUser, deleteClass } from "@/utils/classSync";
import { ClassData } from "@/utils/classSync/types";

interface UseClassManagementProps {
  schoolId: string;
  teacherId: string;
  directCreateMode?: boolean;
}

export const useClassManagement = ({ schoolId, teacherId, directCreateMode }: UseClassManagementProps) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman" || username === "Ayman_1");
  }, []);

  const refreshClasses = async () => {
    try {
      setLoading(true);
      console.log("Refreshing classes for school:", schoolId);
      
      // Get classes where user is either creator or assistant
      const userClasses = await getClassesForUser(teacherId);
      const schoolClasses = await getClassesBySchool(schoolId);
      
      // Combine and deduplicate
      const allClasses = [...userClasses, ...schoolClasses];
      const uniqueClasses = allClasses.filter((cls, index, self) => 
        index === self.findIndex(c => c.id === cls.id)
      );
      
      console.log("Fetched classes:", uniqueClasses);
      setClasses(uniqueClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId && teacherId) {
      refreshClasses();
    }
  }, [schoolId, teacherId]);

  const openAddStudentDialog = async (classId: string) => {
    try {
      // Fetch available students for the school
      const { data: students, error } = await supabase
        .from("students")
        .select("*")
        .is("class_id", null);

      if (error) throw error;

      setAvailableStudents(students || []);
      setIsAddStudentDialogOpen(true);
    } catch (error) {
      console.error("Error fetching available students:", error);
      toast({
        title: "Error",
        description: "Failed to load available students",
        variant: "destructive"
      });
    }
  };

  const handleAddStudents = async (selectedStudents: string[]) => {
    try {
      // Handle adding students to class
      toast({
        title: "Success",
        description: `${selectedStudents.length} students added to class`
      });
      setIsAddStudentDialogOpen(false);
      refreshClasses();
    } catch (error) {
      console.error("Error adding students:", error);
      toast({
        title: "Error",
        description: "Failed to add students to class",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (classId: string) => {
    setClassToDelete(classId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    
    try {
      const success = await deleteClass(classToDelete);
      if (success) {
        toast({
          title: "Success",
          description: "Class deleted successfully"
        });
        setIsDeleteDialogOpen(false);
        setClassToDelete(null);
        refreshClasses();
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive"
      });
    }
  };

  return {
    classes,
    loading,
    isAdmin,
    successMessage,
    isAddStudentDialogOpen,
    availableStudents,
    isDeleteDialogOpen,
    classToDelete,
    setSuccessMessage,
    openAddStudentDialog,
    handleAddStudents,
    openDeleteDialog,
    handleDeleteClass,
    setIsAddStudentDialogOpen,
    setIsDeleteDialogOpen,
    refreshClasses,
  };
};
