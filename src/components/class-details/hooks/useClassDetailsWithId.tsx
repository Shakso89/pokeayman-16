
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getClassById } from "@/utils/classSync/classOperations";
import { createAllStudentProfiles } from "@/services/studentProfileManager";

export const useClassDetailsWithId = (classId?: string) => {
  const { t } = useTranslation();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");
  const [userPermissionLevel, setUserPermissionLevel] = useState<"owner" | "teacher" | "viewer">("viewer");

  console.log("useClassDetailsWithId - Class ID:", classId);
  console.log("useClassDetailsWithId - Loading state:", loading);

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
    
    try {
      // First try to fetch the class using our class operations
      let fetchedClass = await getClassById(classId);
      console.log("useClassDetailsWithId - getClassById result:", fetchedClass);

      // If that fails, try direct Supabase query
      if (!fetchedClass) {
        console.log("useClassDetailsWithId - Trying Supabase direct query");
        const { data: classFromSupabase, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .maybeSingle();
          
        if (classError) {
          console.error("Error fetching class from Supabase:", classError);
          throw classError;
        }
        
        fetchedClass = classFromSupabase;
      }
      
      if (!fetchedClass) {
        console.log("useClassDetailsWithId - No class found, checking localStorage");
        checkLocalStorageFallback();
        return;
      }

      setClassData(fetchedClass);
        
      const currentTeacherId = localStorage.getItem("teacherId") || "";
      
      // Check permissions
      if ((fetchedClass.teacherId === currentTeacherId) || 
          ((fetchedClass as any).teacher_id === currentTeacherId)) {
        setUserPermissionLevel("owner");
      } else if (fetchedClass.assistants && fetchedClass.assistants.includes(currentTeacherId)) {
        setUserPermissionLevel("teacher");
      } else if (isAdmin) {
        setUserPermissionLevel("owner");
      } else {
        setUserPermissionLevel("viewer");
      }
      
      // Fetch students for this class
      await fetchStudentsForClass(classId);
      
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-class-details") || "Failed to load class details",
        variant: "destructive"
      });
      checkLocalStorageFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForClass = async (classId: string) => {
    try {
      console.log(`Fetching students for class: ${classId}`);
      
      // Fetch student IDs from the student_classes join table
      const { data: studentLinks, error: linksError } = await supabase
        .from('student_classes')
        .select('student_id')
        .eq('class_id', classId);

      if (linksError) {
        console.error("Error fetching student links:", linksError);
        throw linksError;
      }

      console.log(`Found ${studentLinks?.length || 0} student links for class ${classId}`);

      if (studentLinks && studentLinks.length > 0) {
        const studentIds = studentLinks.map(link => link.student_id);
        console.log("Student IDs:", studentIds);
        await fetchStudentsWithCoins(studentIds);
      } else {
        console.log(`No students found in student_classes for class ${classId}`);
        setStudents([]);
      }
    } catch (error) {
      console.error("Error in fetchStudentsForClass:", error);
      setStudents([]);
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
        } else if (foundClass.assistants && foundClass.assistants.includes(currentTeacherId)) {
          setUserPermissionLevel("teacher");
        } else if (isAdmin) {
          setUserPermissionLevel("owner");
        } else {
          setUserPermissionLevel("viewer");
        }
        
        if (foundClass.students && foundClass.students.length > 0) {
          fetchStudentsWithCoins(foundClass.students);
        } else {
          setStudents([]);
        }
      } else {
        console.log("useClassDetailsWithId - No class found in localStorage");
        setClassData(null);
      }
    } else {
      console.log("useClassDetailsWithId - No saved classes or ID");
      setClassData(null);
    }
  };

  const fetchStudentsWithCoins = async (studentIds: string[]) => {
    try {
      console.log("Fetching students with coins for IDs:", studentIds);
      
      // Ensure all students have profiles created first
      console.log("Creating missing student profiles...");
      await createAllStudentProfiles();
      
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
        
      if (studentsError) throw studentsError;
      
      console.log("Raw students data:", studentsData);
      
      // Add coin information to each student by fetching from student_profiles
      const studentsWithCoins = await Promise.all((studentsData || []).map(async (student) => {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('coins')
          .eq('user_id', student.id)
          .maybeSingle();
        
        return {
          ...student,
          coins: profile?.coins || 0
        };
      }));
      
      console.log("Students with coins:", studentsWithCoins);
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
        ).map((student: any) => ({
          ...student,
          coins: 0 // Default to 0 coins for localStorage fallback
        }));
        console.log("Fallback students from localStorage:", classStudents);
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
      ((classData as any).teacher_id === currentTeacherId || 
       classData.teacherId === currentTeacherId)
    ) || isAdmin;
  };

  const canManageClass = () => {
    const currentTeacherId = localStorage.getItem("teacherId") || "";
    
    // Class creator can manage
    if (isClassCreator()) {
      return true;
    }
    
    // Assistant can manage (but not delete)
    if (classData && classData.assistants && classData.assistants.includes(currentTeacherId)) {
      return true;
    }
    
    return false;
  };

  return {
    classData,
    students,
    loading,
    isAdmin,
    teacherId,
    userPermissionLevel,
    isClassCreator,
    canManageClass,
    fetchClassDetails,
    t
  };
};
