import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentPokemonCollection, getSchoolPokemonPool, initializeSchoolPokemonPool, updateAllSchoolPoolsTo500, awardCoinsToStudent } from "@/utils/pokemon";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Package, Sword } from "lucide-react";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import MysteryBallTab from "@/components/student/MysteryBallTab";
import SchoolPoolDialog from "@/components/student/SchoolPoolDialog";
import MyClassesTab from "@/components/student/MyClassesTab";
const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const classId = localStorage.getItem("studentClassId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "";
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [schoolPokemons, setSchoolPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState("my-pokemons");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    console.log("StudentDashboard loaded with:", {
      studentId,
      classId,
      schoolId
    });

    // Update all school pools to have 500 Pokémon
    updateAllSchoolPoolsTo500();
    if (studentId) {
      loadStudentData();
      loadActiveBattles();
    }
    if (schoolId) {
      loadSchoolPokemonPool();
    } else {
      console.warn("No schoolId found, creating default school ID");
      // If no school ID is set, use a default one to ensure functionality
      localStorage.setItem("studentSchoolId", "default-school-1");
    }
  }, [studentId, schoolId]);
  const loadStudentData = () => {
    console.log("Loading student data for:", studentId);
    // Load Pokemon collection and coins
    const collection = getStudentPokemonCollection(studentId);
    console.log("Student collection:", collection);
    if (collection) {
      setStudentPokemons(collection.pokemons);
      setCoins(collection.coins);
    } else {
      setStudentPokemons([]);
      setCoins(0);
    }

    // Load avatar
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const student = students.find((s: any) => s.id === studentId);
    if (student && student.avatar) {
      setAvatar(student.avatar);
    }
  };
  const loadSchoolPokemonPool = () => {
    const currentSchoolId = schoolId || localStorage.getItem("studentSchoolId") || "default-school-1";
    console.log("Loading school pokemon pool for:", currentSchoolId);
    // Initialize the school pool if it doesn't exist
    let pool = getSchoolPokemonPool(currentSchoolId);
    if (!pool) {
      pool = initializeSchoolPokemonPool(currentSchoolId);
    }
    console.log("School pokemon pool:", pool);
    if (pool && pool.availablePokemons) {
      setSchoolPokemons(pool.availablePokemons);
    } else {
      setSchoolPokemons([]);
    }
  };
  const loadActiveBattles = () => {
    if (!studentId || !classId || !schoolId) return;
    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];

    // Filter battles relevant to this student
    const relevantBattles = allBattles.filter((battle: any) => {
      // School-wide or specific class
      const isRelevant = battle.schoolId === schoolId && (!battle.classId || battle.classId === classId);
      // Active and not expired
      const isActive = battle.status === "active";
      const isNotExpired = new Date(battle.timeLimit).getTime() > Date.now();
      return isRelevant && isActive && isNotExpired;
    });
    setActiveBattles(relevantBattles);
  };

  // Handle Pokemon won event
  const handlePokemonWon = (pokemon: Pokemon) => {
    console.log("Pokemon won:", pokemon);
    // Refresh data after pokemon is won
    toast({
      title: "Congratulations",
      description: `You got a new Pokemon: ${pokemon.name}!`
    });
    loadStudentData();
    loadSchoolPokemonPool();
  };

  // Handle coins won event
  const handleCoinsWon = (amount: number) => {
    console.log("Coins won:", amount);
    // Add coins to student
    awardCoinsToStudent(studentId, amount);
    // Refresh data
    toast({
      title: "Congratulations",
      description: `You got ${amount} coins!`
    });
    loadStudentData();
  };

  // Handle refresh pool
  const handleRefreshPool = () => {
    setIsLoading(true);
    setTimeout(() => {
      loadSchoolPokemonPool();
      setIsLoading(false);
    }, 1000);
  };

  // Get the current school ID (either from state or localStorage)
  const currentSchoolId = schoolId || localStorage.getItem("studentSchoolId") || "default-school-1";
  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100">
      <NavBar userType="student" userName={studentName} userAvatar={avatar || undefined} />
      
      <div className="container mx-auto py-8 px-4">
        <StudentHeader studentName={studentName} coins={coins} activeBattles={activeBattles} onOpenSchoolPool={() => setShowSchoolPool(true)} />
        
        {/* Rankings button */}
        <div className="flex justify-end mt-4">
          <Link to="/student/rankings">
            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-full shadow-md border-2 border-orange-300 flex items-center gap-2 transform hover:scale-105 transition-all">
              <Trophy className="h-5 w-5" />
              {t("rankings")}
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 relative">
          <Tabs defaultValue="my-pokemons" value={activeTab} onValueChange={setActiveTab} className="w-full mt-8 bg-transparent">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-blue-200 p-2 rounded-full">
              <TabsTrigger value="my-pokemons" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all">
                My Pokémon
              </TabsTrigger>
              <TabsTrigger value="mystery-ball" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                Mystery Ball
              </TabsTrigger>
              <TabsTrigger value="my-classes" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                My Class
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-pokemons" className="mt-4">
              <StudentCollection pokemons={studentPokemons} />
            </TabsContent>
            
            <TabsContent value="mystery-ball" className="mt-4">
              <MysteryBallTab schoolPokemons={schoolPokemons} studentId={studentId} schoolId={currentSchoolId} coins={coins} isLoading={isLoading} onPokemonWon={handlePokemonWon} onCoinsWon={handleCoinsWon} onRefreshPool={handleRefreshPool} />
            </TabsContent>
            
            <TabsContent value="my-classes" className="mt-4">
              <MyClassesTab studentId={studentId} studentName={studentName} classId={classId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* School Pool Dialog */}
      <SchoolPoolDialog open={showSchoolPool} onOpenChange={setShowSchoolPool} schoolId={currentSchoolId} userType="student" />
    </div>;
};
export default StudentDashboard;