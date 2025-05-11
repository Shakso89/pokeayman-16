import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student, Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
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
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [students, setStudents] = useState<StudentWithPokemon[]>([]);
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  useEffect(() => {
    loadStudents();
  }, [classId]);
  const loadStudents = () => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");

      // Filter students for this class
      const classStudents = allStudents.filter((student: Student) => student.classId === classId);
      console.log(`Found ${classStudents.length} students for class ${classId}`);

      // Get Pokemon counts for each student
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");

      // Add Pokemon count information to each student
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

      // Sort students by Pokemon count
      sortStudents(studentsWithPokemon);

      // Add some sample students if none are found and we're in development mode
      if (studentsWithPokemon.length === 0 && import.meta.env.DEV) {
        // This is just for demo purposes - using the correct names as requested
        const sampleStudents = [{
          id: "student-1",
          username: "ariel_waters",
          displayName: "Ariel",
          classId: classId,
          teacherId: "teacher-1",
          createdAt: new Date().toISOString(),
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ariel",
          pokemonCount: 5,
          coins: 50
        }, {
          id: "student-2",
          username: "brian_smith",
          displayName: "Brian",
          classId: classId,
          teacherId: "teacher-1",
          createdAt: new Date().toISOString(),
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian",
          pokemonCount: 3,
          coins: 30
        }, {
          id: "student-3",
          username: "kate_jones",
          displayName: "Kate",
          classId: classId,
          teacherId: "teacher-1",
          createdAt: new Date().toISOString(),
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kate",
          pokemonCount: 4,
          coins: 40
        }];

        // Update localStorage with sample students
        const updatedStudents = [...allStudents];
        sampleStudents.forEach(sampleStudent => {
          const existingIndex = updatedStudents.findIndex(s => s.id === sampleStudent.id);
          if (existingIndex === -1) {
            // Add the student without pokemonCount and coins properties
            const {
              pokemonCount,
              coins,
              ...studentWithoutPokemonData
            } = sampleStudent;
            updatedStudents.push(studentWithoutPokemonData);
          }
        });
        localStorage.setItem("students", JSON.stringify(updatedStudents));

        // Also make sure these students have Pokemon collections
        const updatedStudentPokemons = [...studentPokemons];

        // Add sample Pokemon data for these students if they don't have any
        sampleStudents.forEach(student => {
          const existingIndex = updatedStudentPokemons.findIndex(sp => sp.studentId === student.id);
          if (existingIndex === -1) {
            updatedStudentPokemons.push({
              studentId: student.id,
              pokemons: Array(student.pokemonCount).fill(null).map((_, i) => ({
                id: `pokemon-${student.id}-${i}`,
                name: `Pokemon ${i + 1}`,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 150) + 1}.png`,
                type: "normal",
                rarity: ["common", "uncommon", "rare", "legendary"][Math.floor(Math.random() * 4)] as "common" | "uncommon" | "rare" | "legendary"
              })),
              coins: student.coins
            });
          }
        });
        localStorage.setItem("studentPokemons", JSON.stringify(updatedStudentPokemons));

        // Update state
        setStudents(sampleStudents);
        toast({
          description: "Sample students added for demonstration"
        });
      } else {
        setStudents(studentsWithPokemon);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
      setStudents([]);
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
      
    </Card>;
};
export default StudentsTab;