
import { useState, useEffect } from "react";
import { Student } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentWithPokemon extends Student {
  pokemonCount: number;
  coins: number;
}

export const useStudentsData = (classId: string) => {
  const [students, setStudents] = useState<StudentWithPokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    if (classId) {
      loadStudents();
    }
    
    // Subscribe to student changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'students'
        },
        (payload) => {
          console.log('Student change detected:', payload);
          loadStudents();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const loadStudents = async () => {
    if (!classId) return;
    
    setIsLoading(true);
    try {
      // First try to fetch the class to get the students array
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('students')
        .eq('id', classId)
        .single();
      
      if (classError) {
        console.error("Error fetching class data:", classError);
        throw new Error("Failed to fetch class data");
      }
      
      // Get all students that are in this class
      const studentIds = classData && Array.isArray(classData.students) ? classData.students : [];
      if (studentIds.length === 0) {
        setStudents([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch student details
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
      
      if (studentsError) {
        throw studentsError;
      }
      
      // Add Pokemon count information to each student using localStorage
      // In a real app, we would fetch this from the database too
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");

      // Add Pokemon count information to each student
      const studentsWithPokemon = studentsData.map((student: any) => {
        const pokemonData = studentPokemons.find((p: any) => p.studentId === student.id);
        const pokemonCount = pokemonData ? (pokemonData.pokemons || []).length : 0;
        const coins = pokemonData ? pokemonData.coins : 0;
        return {
          ...student,
          displayName: student.display_name || student.username,
          pokemonCount,
          coins,
        };
      });

      // Sort students by Pokemon count
      sortStudents(studentsWithPokemon);
    } catch (error) {
      console.error("Error loading students:", error);
      
      // Fallback to localStorage
      try {
        // Try to get student IDs for this class first
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const currentClass = allClasses.find((cls: any) => cls.id === classId);
        const studentIds = currentClass && currentClass.students ? currentClass.students : [];
        
        // If we have student IDs, get their details
        if (studentIds.length > 0) {
          const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
          const classStudents = allStudents.filter((student: Student) => 
            studentIds.includes(student.id)
          );
          
          // Add Pokemon count information
          const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
          
          const studentsWithPokemon = classStudents.map((student: Student) => {
            const pokemonData = studentPokemons.find((p: any) => p.studentId === student.id);
            const pokemonCount = pokemonData ? (pokemonData.pokemons || []).length : 0;
            const coins = pokemonData ? pokemonData.coins : 0;
            return {
              ...student,
              pokemonCount,
              coins
            };
          });
          
          // Sort students
          sortStudents(studentsWithPokemon);
        } else {
          // Fallback to class ID matching (older approach)
          const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
          const classStudents = allStudents.filter((student: Student) => student.classId === classId);
          console.log(`Found ${classStudents.length} students for class ${classId}`);
          
          // Add Pokemon count information
          const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
          
          const studentsWithPokemon = classStudents.map((student: Student) => {
            const pokemonData = studentPokemons.find((p: any) => p.studentId === student.id);
            const pokemonCount = pokemonData ? (pokemonData.pokemons || []).length : 0;
            const coins = pokemonData ? pokemonData.coins : 0;
            return {
              ...student,
              pokemonCount,
              coins
            };
          });
          
          // Sort students
          sortStudents(studentsWithPokemon);
        }
      } catch (localError) {
        console.error("Error with localStorage fallback:", localError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students"
        });
        setStudents([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sortStudents = (studentsArray: StudentWithPokemon[]) => {
    const sorted = [...studentsArray].sort((a, b) => {
      if (sortOrder === "desc") {
        return b.pokemonCount - a.pokemonCount;
      } else {
        return a.pokemonCount - b.pokemonCount;
      }
    });
    setStudents(sorted);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    sortStudents(students);
  };

  return { students, isLoading, sortOrder, toggleSortOrder };
};
