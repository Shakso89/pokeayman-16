import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student, Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StudentsTabProps {
  classId: string;
}

interface StudentWithPokemon extends Student {
  pokemonCount: number;
  coins: number;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  classId
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentWithPokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      const studentIds = classData && classData.students ? classData.students : [];
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
      const sorted = [...studentsWithPokemon].sort((a, b) => {
        if (sortOrder === "desc") {
          return b.pokemonCount - a.pokemonCount;
        } else {
          return a.pokemonCount - b.pokemonCount;
        }
      });

      setStudents(sorted);
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
          const sorted = [...studentsWithPokemon].sort((a, b) => {
            if (sortOrder === "desc") {
              return b.pokemonCount - a.pokemonCount;
            } else {
              return a.pokemonCount - b.pokemonCount;
            }
          });
          
          setStudents(sorted);
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
          const sorted = [...studentsWithPokemon].sort((a, b) => {
            if (sortOrder === "desc") {
              return b.pokemonCount - a.pokemonCount;
            } else {
              return a.pokemonCount - b.pokemonCount;
            }
          });
          
          setStudents(sorted);
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

  const handleStudentClick = (studentId: string) => {
    // Navigate to the student profile page
    navigate(`/student/profile/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>{t("loading-students")}</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-50 rounded-full p-6 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">{t("no-students-found")}</p>
      </div>;
  }

  return <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t("class-students")}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSortOrder}
            className="flex items-center gap-1"
          >
            {sortOrder === "desc" ? (
              <>
                <ArrowDownAZ className="h-4 w-4" />
                {t("sort-desc")}
              </>
            ) : (
              <>
                <ArrowUpAZ className="h-4 w-4" />
                {t("sort-asc")}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {students.map(student => (
            <div 
              key={student.id}
              onClick={() => handleStudentClick(student.id)}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={student.avatar} />
                <AvatarFallback>
                  {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 flex-1">
                <p className="font-medium">{student.displayName}</p>
                <p className="text-sm text-gray-500">@{student.username}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold">{student.pokemonCount} {t("pokemon")}</p>
                <p className="text-sm text-gray-500">{student.coins} {t("coins")}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>;
};

export default StudentsTab;
