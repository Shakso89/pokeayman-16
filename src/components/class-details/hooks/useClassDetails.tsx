import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getClassById } from "@/utils/classSync/classOperations";
import { getStudentPokemonCollection } from "@/utils/pokemon/studentPokemon";

export const useClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");
  const [userPermissionLevel, setUserPermissionLevel] = useState<"owner" | "teacher" | "viewer">("viewer");

  // Add debugging
  console.log("useClassDetails - ID from params:", id);
  console.log("useClassDetails - Loading state:", loading);
  console.log("useClassDetails - ClassData:", classData);

  // Check if user is admin or teacher
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman");
    
    const teacherId = localStorage.getItem("teacherId") || "";
    setTeacherId(teacherId);
    console.log("useClassDetails - Teacher ID:", teacherId);
    console.log("useClassDetails - Is Admin:", username === "Admin" || username === "Ayman");
  }, []);

  useEffect(() => {
    if (!id) {
      console.log("useClassDetails - No ID provided, skipping fetch");
      setLoading(false);
      return;
    }
    console.log("useClassDetails - Starting fetch for ID:", id);
    fetchClassDetails();
  }, [id, t, isAdmin, teacherId]);

  const fetchClassDetails = async () => {
    console.log("useClassDetails - fetchClassDetails called for ID:", id);
    setLoading(true);
    try {
      const cls = await getClassById(id || "");
      console.log("useClassDetails - getClassById result:", cls);
      
      if (cls) {
        setClassData(cls);
        
        const currentTeacherId = localStorage.getItem("teacherId") || "";
        if (cls.teacher_id === currentTeacherId) {
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
      
      console.log("useClassDetails - Trying Supabase direct query");
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (classError) {
        console.error("useClassDetails - Supabase error:", classError);
        throw classError;
      }
      
      console.log("useClassDetails - Supabase result:", classData);
      
      if (!classData) {
        console.log("useClassDetails - No class found, checking localStorage");
        checkLocalStorageFallback();
        return;
      }
      
      setClassData(classData);
      
      if (classData.students && classData.students.length > 0) {
        await fetchStudentsWithCoins(classData.students);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
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
    console.log("useClassDetails - checkLocalStorageFallback called");
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses && id) {
      const parsedClasses = JSON.parse(savedClasses);
      console.log("useClassDetails - Local classes:", parsedClasses);
      const foundClass = parsedClasses.find((cls: any) => cls.id === id);
      console.log("useClassDetails - Found local class:", foundClass);
      
      if (foundClass) {
        setClassData(foundClass);
        
        const currentTeacherId = localStorage.getItem("teacherId") || "";
        if (foundClass.teacher_id === currentTeacherId) {
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
        console.log("useClassDetails - No class found in localStorage");
        setClassData(null);
      }
    } else {
      console.log("useClassDetails - No saved classes or ID");
      setClassData(null);
    }
  };

  const fetchStudentsWithCoins = async (studentIds: string[]) => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
        
      if (studentsError) throw studentsError;
      
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
       classData.teacher_id === currentTeacherId)
    ) || isAdmin;
  };

  return {
    id,
    classData,
    students,
    loading,
    isAdmin,
    teacherId,
    userPermissionLevel,
    isClassCreator,
    fetchClassDetails,
    t
  };
};
