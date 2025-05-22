
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ClassData } from "@/utils/classSync/types";
import { removeClass, getClassesBySchool } from "@/utils/classSync/classOperations";
import { useTranslation } from "@/hooks/useTranslation";
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";

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
  }, []);
  
  // Improved fetch classes function with better error handling and logging
  const fetchClasses = async () => {
    if (!schoolId) {
      console.log("No school ID provided, skipping fetch");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching classes for school: ${schoolId}`);
      
      // First try using the utility function
      const classesData = await getClassesBySchool(schoolId);
      if (classesData && classesData.length > 0) {
        console.log(`Classes found via utility function: ${classesData.length}`, classesData);
        setClasses(classesData);
        setLoading(false);
        return;
      }
      
      // If no classes found using utility function, try direct Supabase query
      console.log("No classes found via utility function, trying direct Supabase query");
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) {
        throw error;
      }
      
      console.log(`Classes found via direct query: ${data?.length || 0}`, data);
      
      // Map database class format to ClassData
      const formattedClasses = (data || []).map(dbClass => ({
        id: dbClass.id || '',
        name: dbClass.name || '',
        schoolId: dbClass.school_id || '',
        teacherId: dbClass.teacher_id || null,
        students: dbClass.students || [],
        isPublic: dbClass.is_public !== false,
        description: dbClass.description || '',
        likes: dbClass.likes || [],
        createdAt: dbClass.created_at,
        updatedAt: dbClass.updated_at || dbClass.created_at
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const filteredClasses = allClasses.filter((cls: any) => 
        cls.schoolId === schoolId
      );
      console.log(`Classes from localStorage: ${filteredClasses.length}`, filteredClasses);
      setClasses(filteredClasses);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to Supabase realtime changes for classes
  useEffect(() => {
    if (schoolId) {
      console.log("Setting up realtime subscription for classes in school:", schoolId);
      fetchClasses();
      
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'classes'
          },
          (payload) => {
            console.log("Classes table changed:", payload);
            fetchClasses();
          }
        )
        .subscribe();
        
      return () => {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [schoolId]);

  const openAddStudentDialog = async (classId: string) => {
    setSelectedClassId(classId);
    
    try {
      // Get current class students
      const currentClass = classes.find(c => c.id === classId);
      const currentStudents = currentClass?.students || [];
      
      console.log("Opening add student dialog for class:", classId);
      console.log("Current students in class:", currentStudents);
      
      // Get all available students to add
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('display_name', { ascending: true });
        
      if (error) throw error;
      
      console.log("All students fetched:", data?.length || 0);
      
      // Filter out students already in the class
      const availableStuds = (data || []).filter(student => 
        !currentStudents.includes(student.id)
      );
      
      console.log("Available students to add:", availableStuds.length);
      
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
          
          console.log("Available students from localStorage:", availableStudents.length);
          
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
      console.log(`Adding ${selectedStudents.length} students to class ${selectedClassId}`);
      
      const success = await addMultipleStudentsToClass(selectedClassId, selectedStudents);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${selectedStudents.length} ${t("students-added-to-class")}`
        });
        setIsAddStudentDialogOpen(false);
        fetchClasses(); // Refresh classes after adding students
      } else {
        throw new Error("Failed to add students to class");
      }
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
      console.log("Deleting class:", classToDelete);
      
      const success = await removeClass(classToDelete);
      
      if (success) {
        toast({
          title: t("success"),
          description: t("class-deleted-successfully")
        });
        
        setIsDeleteDialogOpen(false);
        fetchClasses(); // Refresh classes after deletion
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
    isAddStudentDialogOpen,
    availableStudents,
    isDeleteDialogOpen,
    setSuccessMessage,
    openAddStudentDialog,
    handleAddStudents,
    openDeleteDialog,
    handleDeleteClass,
    setIsAddStudentDialogOpen,
    setIsDeleteDialogOpen,
    refreshClasses: fetchClasses, // Expose the refresh function
  };
};
