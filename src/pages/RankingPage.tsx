
import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Trophy, School, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Student, Pokemon } from "@/types/pokemon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PokemonList from "@/components/student/PokemonList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SchoolRankingTab from "@/components/student/SchoolRankingTab";

interface School {
  id: string;
  name: string;
  code: string;
  location?: string;
}

interface StudentWithRank extends Student {
  pokemonCount: number;
  rank: number;
  coins: number;
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
  const [classStudents, setClassStudents] = useState<{ [key: string]: StudentWithRank[] }>({});
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [currentTab, setCurrentTab] = useState<'school' | 'class'>('school');
  
  const userType = localStorage.getItem("userType") as "teacher" | "student";
  const userId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  const userClassId = localStorage.getItem("studentClassId") || "";
  const userSchoolId = localStorage.getItem("studentSchoolId") || "";
  
  // Get all available schools
  useEffect(() => {
    loadAllSchools();
  }, [userType, userId]);
  
  // Load classes when school is selected
  useEffect(() => {
    if (selectedSchool) {
      loadSchoolClasses(selectedSchool.id);
    }
  }, [selectedSchool]);
  
  const loadAllSchools = () => {
    try {
      const allSchools = JSON.parse(localStorage.getItem("schools") || "[]");
      
      // No filtering, show all available schools
      setSchools(allSchools);
      
      // If user is a student, auto-select their school for convenience
      if (userType === "student" && userId && userSchoolId) {
        const school = allSchools.find((s: School) => s.id === userSchoolId);
        if (school) {
          setSelectedSchool(school);
        }
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      setSchools([]);
    }
  };
  
  const loadSchoolClasses = (schoolId: string) => {
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const filteredClasses = allClasses.filter((c: any) => c.schoolId === schoolId);
      
      setClasses(filteredClasses.map((c: any) => ({ 
        id: c.id, 
        name: c.name 
      })));
      
      // For each class, load students
      const classStudentsMap: { [key: string]: StudentWithRank[] } = {};
      
      filteredClasses.forEach((cls: any) => {
        const classStudentList = loadClassStudents(cls.id);
        classStudentsMap[cls.id] = classStudentList;
      });
      
      setClassStudents(classStudentsMap);
      
      // For students, auto-select their class tab
      if (userType === "student" && userClassId) {
        setCurrentTab('class');
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };
  
  const loadClassStudents = (classId: string): StudentWithRank[] => {
    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const filteredStudents = allStudents.filter((s: Student) => s.classId === classId);
      
      // Get Pokemon counts and coins for each student
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      
      const studentsWithPokemonCount = filteredStudents.map((s: Student) => {
        const pokemonData = studentPokemons.find((p: any) => p.studentId === s.id);
        const count = pokemonData ? (pokemonData.pokemons || []).length : 0;
        const coins = pokemonData ? pokemonData.coins || 0 : 0;
        return { ...s, pokemonCount: count, coins };
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
      
      // Return top 10 for class ranking
      return rankedStudents.slice(0, 10);
    } catch (error) {
      console.error("Error loading class students:", error);
      return [];
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
      
      // Get Pokemon counts and coins for each student
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      
      const studentsWithPokemonCount = schoolStudents.map((s: Student) => {
        const pokemonData = studentPokemons.find((p: any) => p.studentId === s.id);
        const count = pokemonData ? (pokemonData.pokemons || []).length : 0;
        const coins = pokemonData ? pokemonData.coins || 0 : 0;
        return { ...s, pokemonCount: count, coins };
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
      
      // Limit to top 20 for school ranking (increased from 10)
      setStudents(rankedStudents.slice(0, 20));
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
  
  const renderStudentList = (studentList: StudentWithRank[], title: string) => {
    if (!studentList || studentList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">{t("no-students")}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-3">{title}</h3>
        {studentList.map(student => (
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
              <p className="text-sm text-gray-500">
                {t("pokemon")} • {student.coins} {t("coins")}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // If user is a student and we have their school, show school ranking directly
  if (userType === "student" && selectedSchool) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar 
          userType={userType}
          userName={localStorage.getItem("studentName") || "Student"}
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
              {selectedSchool.name} - {t("rankings")}
            </h1>
          </div>
          
          <SchoolRankingTab schoolId={selectedSchool.id} />
        </div>
      </div>
    );
  }
  
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
              <div className="flex justify-between items-center">
                <CardTitle>{t("top-students")}</CardTitle>
                <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'school' | 'class')}>
                  <TabsList>
                    <TabsTrigger value="school" className="flex items-center gap-1">
                      <School className="h-4 w-4" />
                      {t("school")}
                    </TabsTrigger>
                    <TabsTrigger value="class" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {t("class")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab}>
                <TabsContent value="school">
                  {renderStudentList(students, `${t("top")} 20 - ${t("school-ranking")}`)}
                </TabsContent>
                
                <TabsContent value="class">
                  {classes.length > 0 ? (
                    <div className="space-y-6">
                      {classes.map(cls => (
                        <div key={cls.id}>
                          <h3 className="font-medium text-lg mb-3 px-2 py-1 bg-gray-50 rounded-md">
                            {cls.name}
                          </h3>
                          {renderStudentList(classStudents[cls.id] || [], `${t("top")} 10 - ${cls.name}`)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl text-gray-500">{t("no-classes")}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
