
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ClassmatesTabProps {
  classId: string;
}

const ClassmatesTab: React.FC<ClassmatesTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [classmates, setClassmates] = useState<Student[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadClassmates();
  }, [classId]);
  
  const loadClassmates = () => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      
      // Filter students for this class
      const classStudents = allStudents.filter((student: Student) => 
        student.classId === classId
      );
      
      console.log(`Found ${classStudents.length} classmates for class ${classId}`);
      
      // Add some sample students if none are found and we're in development mode
      if (classStudents.length === 0 && import.meta.env.DEV) {
        // This is just for demo purposes - using the correct names as requested
        const sampleClassmates = [
          {
            id: "student-1",
            username: "ariel_waters",
            displayName: "Ariel",
            classId: classId,
            teacherId: "teacher-1", 
            createdAt: new Date().toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ariel"
          },
          {
            id: "student-2",
            username: "brian_smith",
            displayName: "Brian",
            classId: classId,
            teacherId: "teacher-1",
            createdAt: new Date().toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian"
          },
          {
            id: "student-3",
            username: "kate_jones",
            displayName: "Kate",
            classId: classId,
            teacherId: "teacher-1",
            createdAt: new Date().toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kate"
          }
        ];
        
        // Update localStorage with sample students
        const updatedStudents = [...allStudents, ...sampleClassmates];
        localStorage.setItem("students", JSON.stringify(updatedStudents));
        
        // Update state
        setClassmates(sampleClassmates);
        
        // Also make sure these students have Pokemon collections for the ranking
        const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
        const updatedStudentPokemons = [...studentPokemons];
        
        // Add sample Pokemon data for these students if they don't have any
        sampleClassmates.forEach(student => {
          const existingIndex = updatedStudentPokemons.findIndex(sp => sp.studentId === student.id);
          if (existingIndex === -1) {
            // Add some random number of pokemons and coins
            const pokemonCount = Math.floor(Math.random() * 5) + 1;
            updatedStudentPokemons.push({
              studentId: student.id,
              pokemons: Array(pokemonCount).fill(null).map((_, i) => ({
                id: `pokemon-${student.id}-${i}`,
                name: `Pokemon ${i+1}`,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 150) + 1}.png`,
                type: "normal",
                rarity: ["common", "uncommon", "rare", "legendary"][Math.floor(Math.random() * 4)] as "common" | "uncommon" | "rare" | "legendary"
              })),
              coins: Math.floor(Math.random() * 100)
            });
          }
        });
        
        localStorage.setItem("studentPokemons", JSON.stringify(updatedStudentPokemons));
        
        toast({
          description: "Sample classmates added for demonstration",
        });
      } else {
        setClassmates(classStudents);
      }
    } catch (error) {
      console.error("Error loading classmates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classmates",
      });
      setClassmates([]);
    }
  };
  
  const handleStudentClick = (studentId: string) => {
    // Always navigate to the student profile page
    navigate(`/student/profile/${studentId}`);
  };
  
  if (classmates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-50 rounded-full p-6 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">{t("no-classmates-found")}</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-6">{t("classmates")}: {classmates.length}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {classmates.map(student => (
            <div
              key={student.id}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleStudentClick(student.id)}
            >
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage src={student.avatar} alt={student.displayName} />
                <AvatarFallback>
                  {student.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h4 className="font-medium text-center">{student.displayName}</h4>
              <p className="text-xs text-gray-500">@{student.username}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassmatesTab;
