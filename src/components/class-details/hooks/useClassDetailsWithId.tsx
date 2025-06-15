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
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");
  const [userPermissionLevel, setUserPermissionLevel] = useState<"owner" | "teacher" | "viewer">("viewer");

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
    try {
      let fetchedClass = await getClassById(classId);
      console.log("useClassDetailsWithId - getClassById result:", fetchedClass);

      if (!fetchedClass) {
        console.log("useClassDetailsWithId - Trying Supabase direct query");
        const { data: classFromSupabase, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .maybeSingle();
        if (classError) throw classError;
        fetchedClass = classFromSupabase;
      }
      
      if (!fetchedClass) {
        console.log("useClassDetailsWithId - No class found, checking localStorage");
        checkLocalStorageFallback();
        setLoading(false);
        return;
      }

      setClassData(fetchedClass);
        
      const currentTeacherId = localStorage.getItem("teacherId") || "";
      if ((fetchedClass.teacherId === currentTeacherId) || (fetchedClass.teacher_id === currentTeacherId)) {
        setUserPermissionLevel("owner");
      } else if (isAdmin) {
        setUserPermissionLevel("owner");
      } else {
        setUserPermissionLevel("viewer");
      }
      
      // Fetch students from student_classes table
      const { data: studentLinks, error: linksError } = await supabase
          .from('student_classes')
          .select('student_id')
          .eq('class_id', classId);

      if (linksError) throw linksError;

      if (studentLinks && studentLinks.length > 0) {
          const studentIds = studentLinks.map(link => link.student_id);
          await fetchStudentsWithCoins(studentIds);
      } else {
          setStudents([]);
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
      }
    } else {
      console.log("useClassDetailsWithId - No saved classes or ID");
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
    isAdmin,
    teacherId,
    userPermissionLevel,
    isClassCreator,
    fetchClassDetails,
    t
  };
};
