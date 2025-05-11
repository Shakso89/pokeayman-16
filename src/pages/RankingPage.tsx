import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Student, Pokemon } from "@/types/pokemon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PokemonList from "@/components/student/PokemonList";

interface School {
  id: string;
  name: string;
  code: string;
  location?: string;
}

interface StudentWithRank extends Student {
  pokemonCount: number;
  rank: number;
}

const RankingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<StudentWithRank[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  
  const userType = localStorage.getItem("userType") as "teacher" | "student";
  const userId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  
  // Get schools the user belongs to
  useEffect(() => {
    loadUserSchools();
  }, [userType, userId]);
  
  const loadUserSchools = () => {
    const allSchools = JSON.parse(localStorage.getItem("schools") || "[]");
    
    if (userType === "student" && userId) {
      // Students can only see their own school
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: Student) => s.id === userId);
      
      if (student && student.schoolId) {
        const school = allSchools.find((s: School) => s.id === student.schoolId);
        if (school) {
          setSchools([school]);
        } else {
          setSchools([]);
        }
      } else {
        setSchools([]);
      }
    } else if (userType === "teacher" && userId) {
      // Teachers can see schools they are assigned to
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => t.id === userId);
      
      if (teacher && teacher.schools?.length) {
        const teacherSchools = allSchools.filter((s: School) => 
          teacher.schools.includes(s.id)
        );
        setSchools(teacherSchools);
      } else if (userId === "admin") {
        // Admin can see all schools
        setSchools(allSchools);
      } else {
        setSchools([]);
      }
    }
  };
  
  const selectSchool = (school: School) => {
    setSelectedSchool(school);
    loadSchoolStudents(school.id);
  };
  
  const loadSchoolStudents = (schoolId: string) => {
    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const schoolStudents = allStudents.filter((s: Student) => s.schoolId === schoolId);
      
      // Get Pokemon counts for each student
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      
      const studentsWithPokemonCount = schoolStudents.map((s: Student) => {
        const pokemonData = studentPokemons.find((p: any) => p.studentId === s.id);
        const count = pokemonData ? (pokemonData.pokemons || []).length : 0;
        return { ...s, pokemonCount: count };
      });
      
      // Sort by Pokemon count
      const sortedStudents = studentsWithPokemonCount.sort((a: any, b: any) => 
        b.pokemonCount - a.pokemonCount
      );
      
      // Add rank
      const rankedStudents = sortedStudents.map((student: any, index: number) => ({
        ...student,
        rank: index + 1
      }));
      
      // Limit to top 10
      setStudents(rankedStudents.slice(0, 10));
    } catch (error) {
      console.error("Error loading school students:", error);
    }
  };
  
  const handleStudentClick = (student: StudentWithRank) => {
    setSelectedStudent(student);
    
    // Load student's Pokemon
    try {
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const pokemonData = studentPokemons.find((p: any) => p.studentId === student.id);
      
      if (pokemonData && pokemonData.pokemons) {
        setStudentPokemons(pokemonData.pokemons);
      } else {
        setStudentPokemons([]);
      }
    } catch (error) {
      console.error("Error loading student pokemon:", error);
      setStudentPokemons([]);
    }
  };
  
  const getRankingColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-700";
      default:
        return "bg-gray-200";
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType}
        userName={
          userType === "teacher" 
            ? localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") 
            : localStorage.getItem("studentName")
        } 
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">
            {selectedSchool ? selectedSchool.name : t("school-rankings")}
          </h1>
          {selectedSchool && (
            <Button 
              variant="ghost"
              onClick={() => setSelectedSchool(null)}
              className="ml-4"
            >
              {t("back-to-schools")}
            </Button>
          )}
        </div>
        
        {!selectedSchool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.length > 0 ? (
              schools.map(school => (
                <Card 
                  key={school.id} 
                  className="cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => selectSchool(school)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{school.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("code")}:</span>
                        <Badge variant="secondary">{school.code}</Badge>
                      </div>
                      {school.location && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{t("location")}:</span>
                          <span>{school.location}</span>
                        </div>
                      )}
                      <Button className="mt-2 w-full">
                        {t("view-rankings")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-500">{t("no-schools")}</p>
                <p className="mt-2 text-gray-400">{t("no-schools-description")}</p>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("top-students")}</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  {students.map(student => (
                    <div 
                      key={student.id}
                      className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStudentClick(student)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRankingColor(student.rank)}`}>
                        {student.rank <= 3 ? <Trophy size={16} /> : student.rank}
                      </div>
                      
                      <div className="ml-4 flex-1 flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-medium">{student.displayName}</p>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold">{student.pokemonCount}</p>
                        <p className="text-sm text-gray-500">{t("pokemon")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">{t("no-students")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Student Pokemon Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.displayName}'s {t("pokemon-collection")}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PokemonList 
              pokemons={studentPokemons} 
              onPokemonClick={(pokemon) => setSelectedPokemon(pokemon)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Pokémon View Modal */}
      <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPokemon?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPokemon && (
            <div className="flex flex-col items-center p-4">
              <img 
                src={selectedPokemon.image} 
                alt={selectedPokemon.name}
                className="w-48 h-48 object-contain mb-4" 
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("type")}:</p>
                  <p>{selectedPokemon.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("rarity")}:</p>
                  <p>{selectedPokemon.rarity}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankingPage;
