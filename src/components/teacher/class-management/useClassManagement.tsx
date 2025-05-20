
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ClassData } from "@/utils/classSync/types";
import { removeClass } from "@/utils/classSync/classOperations";
import { useTranslation } from "@/hooks/useTranslation";

interface UseClassManagementProps {
  schoolId: string;
  teacherId: string;
  directCreateMode?: boolean;
}

export const useClassManagement = ({ 
  schoolId, 
  teacherId,
  directCreateMode = false
}: UseClassManagementProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [justCreatedClass, setJustCreatedClass] = useState<ClassData | null>(null);
  
  // Add students dialog state
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  
  // Delete class dialog state
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Check if current user is Admin
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    const isAdminUser = username === "Admin" || username === "Ayman" || localStorage.getItem("isAdmin") === "true";
    setIsAdmin(isAdminUser);
    
    console.log("Admin status check:", {
      username,
      isAdminFlag: localStorage.getItem("isAdmin"),
      result: isAdminUser
    });
  }, []);
  
  // Load classes on component mount and subscribe to changes
  useEffect(() => {
    fetchClasses();
    
    // Subscribe to class changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          fetchClasses();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, teacherId]);
  
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) {
        throw error;
      }
      
      // Map database class format to ClassData
      const formattedClasses = data.map(dbClass => ({
        id: dbClass.id || '',
        name: dbClass.name || '',
        schoolId: dbClass.school_id || '',
        teacherId: dbClass.teacher_id || null,
        students: dbClass.students || [],
        isPublic: dbClass.is_public !== false,
        description: dbClass.description || '',
        likes: dbClass.likes || [],
        createdAt: dbClass.created_at,
        updatedAt: dbClass.updated_at || dbClass.created_at // Add updatedAt field with fallback
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const filteredClasses = allClasses.filter((cls: any) => 
        cls.schoolId === schoolId
      );
      setClasses(filteredClasses);
    } finally {
      setLoading(false);
    }
  };

  const handleClassCreated = (createdClass: ClassData | null) => {
    if (createdClass) {
      setJustCreatedClass(createdClass);
      setSuccessMessage(t("class-created-successfully"));
      
      // Fetch updated classes
      fetchClasses();
      
      // If in direct create mode, navigate to the class details page
      if (directCreateMode && createdClass.id) {
        navigate(`/class-details/${createdClass.id}`);
      }
    }
  };
  
  const openAddStudentDialog = async (classId: string) => {
    setSelectedClassId(classId);
    
    try {
      // Get current class students
      const currentClass = classes.find(c => c.id === classId);
      const currentStudents = currentClass?.students || [];
      
      // Get all available students to add
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('display_name', { ascending: true });
        
      if (error) throw error;
      
      // Filter out students already in the class
      const availableStuds = (data || []).filter(student => 
        !currentStudents.includes(student.id)
      );
      
      setAvailableStudents(availableStuds);
      setIsAddStudentDialogOpen(true);
    } catch (error) {
      console.error("Error fetching students:", error);
      
      // Try to get students from localStorage
      try {
        const savedStudents = localStorage.getItem("students");
        const currentClass = classes.find(c => c.id === classId);
        const currentStudents = currentClass?.students || [];
        
        if (savedStudents) {
          const allStudents = JSON.parse(savedStudents);
          const availableStudents = allStudents.filter((student: any) => 
            !currentStudents.includes(student.id)
          );
          
          setAvailableStudents(availableStudents);
          setIsAddStudentDialogOpen(true);
        } else {
          toast({
            title: t("error"),
            description: t("failed-to-load-students"),
            variant: "destructive"
          });
        }
      } catch (localError) {
        console.error("Error accessing localStorage:", localError);
        toast({
          title: t("error"),
          description: t("failed-to-load-students"),
          variant: "destructive"
        });
      }
    }
  };
  
  const handleAddStudents = async (selectedStudents: string[]) => {
    if (!selectedClassId || selectedStudents.length === 0) return;
    
    try {
      // Get current class
      const currentClass = classes.find(c => c.id === selectedClassId);
      if (!currentClass) throw new Error("Class not found");
      
      // Update students array
      const updatedStudents = [...(currentClass.students || []), ...selectedStudents];
      
      // Update class in Supabase
      const { error } = await supabase
        .from('classes')
        .update({ students: updatedStudents })
        .eq('id', selectedClassId);
        
      if (error) {
        console.error("Error updating class in Supabase:", error);
        // Fallback to localStorage
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = allClasses.map((cls: any) => {
          if (cls.id === selectedClassId) {
            return {
              ...cls,
              students: updatedStudents
            };
          }
          return cls;
        });
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        
        // Also update in-memory classes
        setClasses(classes.map(cls => 
          cls.id === selectedClassId ? { ...cls, students: updatedStudents } : cls
        ));
      }
      
      // Also update student class_id fields
      for (const studentId of selectedStudents) {
        try {
          await supabase
            .from('students')
            .update({ class_id: selectedClassId })
            .eq('id', studentId);
        } catch (error) {
          console.error(`Error updating student ${studentId} class_id:`, error);
          // Fallback to localStorage for this student
          const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
          const updatedStudents = allStudents.map((student: any) => {
            if (student.id === studentId) {
              return {
                ...student,
                classId: selectedClassId
              };
            }
            return student;
          });
          localStorage.setItem("students", JSON.stringify(updatedStudents));
        }
      }
      
      toast({
        title: t("success"),
        description: `${selectedStudents.length} ${t("students-added-to-class")}`
      });
      
      setIsAddStudentDialogOpen(false);
      fetchClasses();
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
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
      const success = await removeClass(classToDelete);
      
      if (success) {
        toast({
          title: t("success"),
          description: t("class-deleted-successfully")
        });
        
        setIsDeleteDialogOpen(false);
        fetchClasses();
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-delete-class"),
        variant: "destructive"
      });
    }
  };
  
  return {
    classes,
    loading,
    isAdmin,
    successMessage,
    justCreatedClass,
    isAddStudentDialogOpen,
    availableStudents,
    isDeleteDialogOpen,
    setSuccessMessage,
    handleClassCreated,
    openAddStudentDialog,
    handleAddStudents,
    openDeleteDialog,
    handleDeleteClass,
    setIsAddStudentDialogOpen,
    setIsDeleteDialogOpen,
  };
};
