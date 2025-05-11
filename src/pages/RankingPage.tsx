
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Trophy, School, Users, ArrowLeft } from "lucide-react";
import { getStudentPokemonCollection } from "@/utils/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RankingStudent {
  id: string;
  displayName: string;
  avatar?: string;
  pokemonCount: number;
  rareCount: number;
  legendaryCount: number;
  coins: number;
  classId?: string;
  schoolId?: string;
}

interface SchoolInfo {
  id: string;
  name: string;
}

interface Pokemon {
  id: string;
  name: string;
  image: string;
  rarity: string;
}

const RankingPage: React.FC = () => {
  const [students, setStudents] = useState<RankingStudent[]>([]);
  const [rankingType, setRankingType] = useState<"pokemon" | "rare" | "legendary" | "coins">("pokemon");
  const [scope, setScope] = useState<"class" | "school">("class");
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<RankingStudent | null>(null);
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation();
  
  // Get user info
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentId = localStorage.getItem("studentId") || "";
  const teacherId = localStorage.getItem("teacherId") || "";
  const classId = localStorage.getItem("studentClassId") || localStorage.getItem("teacherClassId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || localStorage.getItem("teacherSchoolId") || "";
  const username = userType === "student" ? 
    localStorage.getItem("studentName") || "" : 
    localStorage.getItem("teacherUsername") || "";

  useEffect(() => {
    // Load schools based on user type and affiliation
    loadUserSchools();
  }, [userType, studentId, teacherId]);

  const loadUserSchools = () => {
    const storedSchools = JSON.parse(localStorage.getItem("schools") || "[]");
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    
    if (userType === "student" && studentId && schoolId) {
      // Students only see their own school
      const studentSchool = storedSchools.find((school: any) => school.id === schoolId);
      if (studentSchool) {
        setSchools([{
          id: studentSchool.id,
          name: studentSchool.name
        }]);
      }
    } else if (userType === "teacher" && teacherId) {
      // Find the current teacher
      const currentTeacher = teachers.find((t: any) => t.id === teacherId);
      if (currentTeacher && currentTeacher.schools && currentTeacher.schools.length > 0) {
        // Get all schools this teacher belongs to
        const teacherSchools = storedSchools
          .filter((school: any) => currentTeacher.schools.includes(school.id))
          .map((school: any) => ({
            id: school.id,
            name: school.name
          }));
        setSchools(teacherSchools);
      } else {
        // Fallback to all schools if no specific assignment found
        setSchools(storedSchools.map((school: any) => ({
          id: school.id,
          name: school.name
        })));
      }
    }
  };

  useEffect(() => {
    loadStudentRankings();
  }, [scope, rankingType, selectedSchoolId]);

  const loadStudentRankings = () => {
    try {
      // Get students from localStorage
      const storedStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const rankings: RankingStudent[] = [];

      // For each student, calculate their ranking metrics
      storedStudents.forEach((student: any) => {
        // Get their Pokemon collection
        const collection = getStudentPokemonCollection(student.id);
        
        if (collection) {
          const pokemons = collection.pokemons || [];
          const rarePokemons = pokemons.filter(p => p.rarity === 'rare');
          const legendaryPokemons = pokemons.filter(p => p.rarity === 'legendary');
          
          rankings.push({
            id: student.id,
            displayName: student.displayName,
            avatar: student.avatar,
            pokemonCount: pokemons.length,
            rareCount: rarePokemons.length,
            legendaryCount: legendaryPokemons.length,
            coins: collection.coins || 0,
            classId: student.classId,
            schoolId: student.schoolId
          });
        } else {
          // Student with no collection
          rankings.push({
            id: student.id,
            displayName: student.displayName,
            avatar: student.avatar,
            pokemonCount: 0,
            rareCount: 0,
            legendaryCount: 0,
            coins: 0,
            classId: student.classId,
            schoolId: student.schoolId
          });
        }
      });

      // Filter rankings based on scope
      let filteredRankings = rankings;
      if (scope === "class" && classId) {
        filteredRankings = rankings.filter(student => student.classId === classId);
      } else if (scope === "school") {
        if (selectedSchoolId) {
          filteredRankings = rankings.filter(student => student.schoolId === selectedSchoolId);
        } else if (schoolId) {
          filteredRankings = rankings.filter(student => student.schoolId === schoolId);
        }
      }

      // Sort rankings based on selected ranking type
      const sortedRankings = [...filteredRankings].sort((a, b) => {
        switch (rankingType) {
          case "pokemon":
            return b.pokemonCount - a.pokemonCount;
          case "rare":
            return b.rareCount - a.rareCount;
          case "legendary":
            return b.legendaryCount - a.legendaryCount;
          case "coins":
            return b.coins - a.coins;
          default:
            return 0;
        }
      });

      // Take only top 10
      setStudents(sortedRankings.slice(0, 10));
    } catch (error) {
      console.error("Error loading rankings:", error);
      setStudents([]);
    }
  };

  // Reset selected school when changing to class scope
  useEffect(() => {
    if (scope === "class") {
      setSelectedSchoolId(null);
    }
  }, [scope]);

  // Load student's Pokemon collection when a student is selected
  const handleViewStudentCollection = (student: RankingStudent) => {
    setSelectedStudent(student);
    const collection = getStudentPokemonCollection(student.id);
    if (collection && collection.pokemons) {
      setStudentPokemons(collection.pokemons);
    } else {
      setStudentPokemons([]);
    }
    setIsDialogOpen(true);
  };

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  const handleSchoolSelect = (id: string) => {
    setSelectedSchoolId(id);
  };

  const handleBackToSchools = () => {
    setSelectedSchoolId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType as "teacher" | "student"} 
        userName={username}
      />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold mb-2">{t("student-rankings")}</h2>
            <p className="text-gray-100">{t("see-top-students")}</p>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <Tabs defaultValue="class" value={scope} onValueChange={(v) => setScope(v as "class" | "school")}>
            <TabsList>
              <TabsTrigger value="class">
                <Medal className="mr-2 h-4 w-4" />
                {t("class-ranking")}
              </TabsTrigger>
              <TabsTrigger value="school">
                <Trophy className="mr-2 h-4 w-4" />
                {t("school-ranking")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {scope === "school" && !selectedSchoolId ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="mr-2 h-5 w-5" />
                {t("select-school")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schools.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("no-schools-found")}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {schools.map(school => (
                    <Card 
                      key={school.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSchoolSelect(school.id)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <School className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{school.name}</h3>
                          <p className="text-sm text-gray-500">{t("view-rankings")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {scope === "school" && selectedSchoolId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBackToSchools}
                      className="mr-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      {t("back-to-schools")}
                    </Button>
                  )}
                  <div>
                    {scope === "class" ? t("top-10-students-class") : t("top-10-students-school")}
                    {scope === "school" && selectedSchoolId && (
                      <span className="ml-2 text-sm font-normal">
                        {schools.find(s => s.id === selectedSchoolId)?.name}
                      </span>
                    )}
                  </div>
                </div>
                <Tabs defaultValue="pokemon" value={rankingType} onValueChange={(v) => setRankingType(v as "pokemon" | "rare" | "legendary" | "coins")}>
                  <TabsList>
                    <TabsTrigger value="pokemon">{t("total-pokemon")}</TabsTrigger>
                    <TabsTrigger value="rare">{t("rare-pokemon")}</TabsTrigger>
                    <TabsTrigger value="legendary">{t("legendary-pokemon")}</TabsTrigger>
                    <TabsTrigger value="coins">{t("coins")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">{t("rank")}</TableHead>
                    <TableHead>{t("student")}</TableHead>
                    <TableHead className="text-right">
                      {rankingType === "pokemon" && t("pokemon-count")}
                      {rankingType === "rare" && t("rare-pokemon")}
                      {rankingType === "legendary" && t("legendary-pokemon")}
                      {rankingType === "coins" && t("coins")}
                    </TableHead>
                    <TableHead className="w-24 text-center">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id} className={student.id === studentId ? "bg-purple-50" : ""}>
                      <TableCell className="font-medium">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                          ${index === 0 ? "bg-yellow-500 text-white" : 
                            index === 1 ? "bg-gray-400 text-white" : 
                            index === 2 ? "bg-amber-800 text-white" : 
                            "bg-gray-100"}`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} alt={student.displayName} />
                          <AvatarFallback>
                            {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                          </AvatarFallback>
                        </Avatar>
                        {student.displayName}
                        {student.id === studentId && (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
                            {t("you")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {rankingType === "pokemon" && student.pokemonCount}
                        {rankingType === "rare" && student.rareCount}
                        {rankingType === "legendary" && student.legendaryCount}
                        {rankingType === "coins" && student.coins}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewStudentCollection(student)}
                        >
                          {t("view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {t("no-students-found")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog to show student's Pokemon collection */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStudent?.displayName}'s {t("pokemon-collection")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {studentPokemons.length > 0 ? (
              studentPokemons.map((pokemon) => (
                <div 
                  key={pokemon.id} 
                  className={`border rounded-lg p-2 text-center ${
                    pokemon.rarity === 'legendary' ? 'bg-yellow-50 border-yellow-200' :
                    pokemon.rarity === 'rare' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50'
                  }`}
                >
                  <img 
                    src={pokemon.image} 
                    alt={pokemon.name}
                    className="w-full h-24 object-contain mx-auto" 
                  />
                  <p className="font-medium text-sm mt-1">{pokemon.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pokemon.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    pokemon.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pokemon.rarity}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-6 text-center text-gray-500">
                <p>{t("no-pokemon-found")}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankingPage;
