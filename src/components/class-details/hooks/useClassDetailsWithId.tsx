
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getClassById } from "@/utils/classSync/classOperations";
import { getStudentPokemonCollection } from "@/utils/pokemon/studentPokemon";

export const useClassDetailsWithId = (classId?: string) => {
  const { t } = useTranslation();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");
  const [userPermissionLevel, setUserPermissionLevel] = useState<"owner" | "teacher" | "viewer">("viewer");
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  // Dialog states for class management
  const [dialogs, setDialogs] = useState({
    addStudent: false,
    removeStudent: { open: false, studentId: "", studentName: "" },
    managePokemon: { open: false, studentId: "", studentName: "", schoolId: "" },
    giveCoins: { open: false, studentId: "", studentName: "" },
    removeCoins: { open: false, studentId: "", studentName: "" },
    schoolPool: false
  });

  // Dialog handlers
  const handlers = {
    handleAddStudent: () => setDialogs(prev => ({ ...prev, addStudent: true })),
    handleRemoveStudent: (studentId: string, studentName: string) => 
      setDialogs(prev => ({ ...prev, removeStudent: { open: true, studentId, studentName } })),
    handleManagePokemon: (studentId: string, studentName: string, schoolId: string) =>
      setDialogs(prev => ({ ...prev, managePokemon: { open: true, studentId, studentName, schoolId } })),
    handleAwardCoins: (studentId: string, studentName: string) =>
      setDialogs(prev => ({ ...prev, giveCoins: { open: true, studentId, studentName } })),
    handleRemoveCoins: (studentId: string, studentName: string) =>
      setDialogs(prev => ({ ...prev, removeCoins: { open: true, studentId, studentName } })),
    handleViewSchoolPool: () => setDialogs(prev => ({ ...prev, schoolPool: true })),
    handleRemovePokemon: (studentId: string, studentName: string) => {
      console.log("Remove pokemon for:", studentName);
    }
  };

  // Add debugging
  console.log("useClassDetailsWithId - Class ID:", classId);
  console.log("useClassDetailsWithId - Loading state:", loading);
  console.log("useClassDetailsWithId - ClassData:", classData);

  // Check if user is admin or teacher
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman");
    
    const teacherId = localStorage.getItem("teacherId") || "";
    setTeacherId(teacherId);
    console.log("useClassDetailsWithId - Teacher ID:", teacherId);
    console.log("useClassDetailsWithId - Is Admin:", username === "Admin" || username === "Ayman");
  }, []);

  useEffect(() => {
    if (!classId) {
      console.log("useClassDetailsWithId - No ID provided, skipping fetch");
      setLoading(false);
      return;
    }
    console.log("useClassDetailsWithId - Starting fetch for ID:", classId);
    fetchClassDetails();
  }, [classId, t, isAdmin, teacherId]);

  const fetchClassDetails = async () => {
    if (!classId) return;
    
    console.log("useClassDetailsWithId - fetchClassDetails called for ID:", classId);
    setLoading(true);
    setError(null);
    
    try {
      const cls = await getClassById(classId);
      console.log("useClassDetailsWithId - getClassById result:", cls);
      
      if (cls) {
        setClassData(cls);
        
        const currentTeacherId = localStorage.getItem("teacherId") || "";
        if (cls.teacherId === currentTeacherId) {
          setUserPermissionLevel("owner");
        } else if (isAdmin) {
          setUserPermissionLevel("owner");
        } else {
          setUserPermissionLevel("viewer");
        }
        
        if (cls.students && cls.students.length > 0) {
          await fetchStudentsWithCoins(cls.students);
        }
        setLoading(false);
        return;
      }
      
      console.log("useClassDetailsWithId - Trying Supabase direct query");
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .maybeSingle();
        
      if (classError) {
        console.error("useClassDetailsWithId - Supabase error:", classError);
        throw classError;
      }
      
      console.log("useClassDetailsWithId - Supabase result:", classData);
      
      if (!classData) {
        console.log("useClassDetailsWithId - No class found, checking localStorage");
        checkLocalStorageFallback();
        return;
      }
      
      setClassData(classData);
      
      if (classData.students && classData.students.length > 0) {
        await fetchStudentsWithCoins(classData.students);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      setError("Failed to load class details");
      toast({
        title: t("error"),
        description: t("failed-to-load-class-details"),
        variant: "destructive"
      });
      checkLocalStorageFallback();
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorageFallback = () => {
    console.log("useClassDetailsWithId - checkLocalStorageFallback called");
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses && classId) {
      const parsedClasses = JSON.parse(savedClasses);
      console.log("useClassDetailsWithId - Local classes:", parsedClasses);
      const foundClass = parsedClasses.find((cls: any) => cls.id === classId);
      console.log("useClassDetailsWithId - Found local class:", foundClass);
      
      if (foundClass) {
        setClassData(foundClass);
        
        const currentTeacherId = localStorage.getItem("teacherId") || "";
        if (foundClass.teacherId === currentTeacherId) {
          setUserPermissionLevel("owner");
        } else if (isAdmin) {
          setUserPermissionLevel("owner");
        } else {
          setUserPermissionLevel("viewer");
        }
        
        if (foundClass.students && foundClass.students.length > 0) {
          fetchStudentsWithCoins(foundClass.students);
        }
      } else {
        console.log("useClassDetailsWithId - No class found in localStorage");
        setClassData(null);
        setError("Class not found");
      }
    } else {
      console.log("useClassDetailsWithId - No saved classes or ID");
      setClassData(null);
      setError("Class not found");
    }
  };

  const fetchStudentsWithCoins = async (studentIds: string[]) => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
        
      if (studentsError) throw studentsError;
      
      // Add coin information to each student
      const studentsWithCoins = (studentsData || []).map(student => {
        const pokemonCollection = getStudentPokemonCollection(student.id);
        return {
          ...student,
          coins: pokemonCollection?.coins || 0
        };
      });
      
      setStudents(studentsWithCoins);
    } catch (error) {
      console.error("Error fetching students from Supabase:", error);
      fetchStudentsFromLocalStorage(studentIds);
    }
  };

  const fetchStudentsFromLocalStorage = (studentIds: string[]) => {
    try {
      const savedStudents = localStorage.getItem("students");
      if (savedStudents) {
        const parsedStudents = JSON.parse(savedStudents);
        const classStudents = parsedStudents.filter((student: any) => 
          studentIds.includes(student.id)
        ).map((student: any) => {
          const pokemonCollection = getStudentPokemonCollection(student.id);
          return {
            ...student,
            coins: pokemonCollection?.coins || 0
          };
        });
        setStudents(classStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students from localStorage:", error);
      setStudents([]);
    }
  };

  const isClassCreator = () => {
    const currentTeacherId = localStorage.getItem("teacherId") || "";
    return (classData && 
      (classData.teacher_id === currentTeacherId || 
       classData.teacherId === currentTeacherId)
    ) || isAdmin;
  };

  return {
    classData,
    students,
    loading,
    error,
    isAdmin,
    teacherId,
    userPermissionLevel,
    isClassCreator,
    fetchClassDetails,
    t,
    pendingSubmissions,
    dialogs,
    handlers
  };
};
