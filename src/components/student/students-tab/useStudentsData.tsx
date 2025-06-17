import { useState, useEffect } from "react";
import { Student } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentWithPokemon extends Student {
  pokemonCount: number;
  coins: number;
  user_id?: string; // Add user_id for proper identification
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
      console.log("Loading students for class:", classId);
      
      // Fetch students through the student_classes join table with proper data
      const { data: studentClassData, error: studentClassError } = await supabase
        .from('student_classes')
        .select(`
          student_id,
          students!inner(
            id,
            username,
            display_name,
            school_id,
            created_at
          )
        `)
        .eq('class_id', classId);

      if (studentClassError) {
        console.error("Error fetching student-class relationships:", studentClassError);
        throw studentClassError;
      }

      if (!studentClassData || studentClassData.length === 0) {
        console.log("No students found for class:", classId);
        setStudents([]);
        setIsLoading(false);
        return;
      }

      console.log("Found student-class relationships:", studentClassData);

      // Extract student IDs and get their profiles
      const studentIds = studentClassData.map(sc => sc.student_id);
      
      // Get student profiles to find user_ids for coin operations
      const { data: studentProfiles, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, user_id, username, display_name, coins')
        .in('id', studentIds);

      if (profileError) {
        console.error("Error fetching student profiles:", profileError);
      }

      // Create a map of student profile data
      const profileMap = new Map();
      if (studentProfiles) {
        studentProfiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }

      // Also try to map by username if direct ID mapping fails
      const usernameProfileMap = new Map();
      if (studentProfiles) {
        studentProfiles.forEach(profile => {
          usernameProfileMap.set(profile.username, profile);
        });
      }

      // Combine student data with profile data
      const enrichedStudents = studentClassData.map((sc: any) => {
        const student = sc.students;
        const profile = profileMap.get(sc.student_id) || usernameProfileMap.get(student.username);
        
        console.log(`Processing student: ${student.username}, Profile found:`, !!profile);
        
        return {
          id: student.id,
          username: student.username,
          displayName: student.display_name || student.username,
          display_name: student.display_name,
          school_id: student.school_id,
          classId: classId,
          user_id: profile?.user_id, // Include user_id for coin operations
          coins: profile?.coins || 0,
          pokemonCount: 0, // Will be updated below
          created_at: student.created_at
        };
      });

      // Add Pokemon count information (keeping existing localStorage logic for now)
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      
      const studentsWithPokemon = enrichedStudents.map((student: any) => {
        const pokemonData = studentPokemons.find((p: any) => 
          p.studentId === student.id || p.studentId === student.user_id
        );
        const pokemonCount = pokemonData ? (pokemonData.pokemons || []).length : 0;
        
        return {
          ...student,
          pokemonCount
        };
      });

      console.log("Final enriched students:", studentsWithPokemon);

      // Sort students by Pokemon count
      sortStudents(studentsWithPokemon);
    } catch (error) {
      console.error("Error loading students:", error);
      
      // Fallback to localStorage (keeping existing logic)
      try {
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const currentClass = allClasses.find((cls: any) => cls.id === classId);
        const studentIds = currentClass && currentClass.students ? currentClass.students : [];
        
        if (studentIds.length > 0) {
          const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
          const classStudents = allStudents.filter((student: Student) => 
            studentIds.includes(student.id)
          );
          
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
          
          sortStudents(studentsWithPokemon);
        } else {
          const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
          const classStudents = allStudents.filter((student: Student) => student.classId === classId);
          
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

  const refreshStudents = loadStudents;

  return { students, isLoading, sortOrder, toggleSortOrder, refreshStudents };
};
