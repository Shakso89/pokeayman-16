
import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentPokemonCollection, getSchoolPokemonPool, initializeSchoolPokemonPool, awardCoinsToStudent } from "@/utils/pokemon";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";

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
  const { t } = useTranslation();
  const { toast } = useToast();
  
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
    const pool = initializeSchoolPokemonPool(currentSchoolId);
    console.log("School pokemon pool:", pool);
    if (pool) {
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
  
  return <div className="min-h-screen bg-gray-100">
      <NavBar userType="student" userName={studentName} userAvatar={avatar || undefined} />
      
      <div className="container mx-auto py-8 px-4">
        <StudentHeader studentName={studentName} coins={coins} activeBattles={activeBattles} onOpenSchoolPool={() => setShowSchoolPool(true)} />
        
        {/* Rankings button */}
        <div className="flex justify-end mt-4">
          <Link to="/student/rankings">
            <Button className="flex items-center gap-2" variant="ranking">
              <Trophy className="h-4 w-4" />
              {t("view-rankings")}
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 relative">
          <Tabs defaultValue="my-pokemons" className="w-full mt-8" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="my-pokemons">My Pokémons</TabsTrigger>
              <TabsTrigger value="mystery-ball">Mystery Ball</TabsTrigger>
              <TabsTrigger value="school-pool">School Pool</TabsTrigger>
              <TabsTrigger value="my-classes" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("my-classes")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-pokemons" className="mt-4">
              <StudentCollection pokemons={studentPokemons} />
            </TabsContent>
            
            <TabsContent value="mystery-ball" className="mt-4">
              <MysteryBallTab 
                schoolPokemons={schoolPokemons} 
                studentId={studentId} 
                schoolId={currentSchoolId} 
                coins={coins} 
                isLoading={isLoading} 
                onPokemonWon={handlePokemonWon} 
                onCoinsWon={handleCoinsWon} 
                onRefreshPool={handleRefreshPool} 
              />
            </TabsContent>
            
            <TabsContent value="school-pool" className="mt-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">School Pokémon Pool</h2>
                <p className="text-center mb-6 text-gray-600">Available Pokémon in your school pool: {schoolPokemons.length}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  {schoolPokemons.map(pokemon => (
                    <div key={pokemon.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <img src={pokemon.image} alt={pokemon.name} className="w-full h-24 object-contain mx-auto" />
                      <div className="mt-2 text-center">
                        <p className="font-medium text-sm">{pokemon.name}</p>
                        <p className="text-xs text-gray-500">{pokemon.type}</p>
                        <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-xs text-white ${pokemon.rarity === 'legendary' ? 'bg-yellow-500' : pokemon.rarity === 'rare' ? 'bg-purple-500' : pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'}`}>
                          {pokemon.rarity}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {schoolPokemons.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No Pokémon available in the school pool.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="my-classes" className="mt-4">
              <MyClassesTab 
                studentId={studentId}
                studentName={studentName}
                classId={classId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* School Pool Dialog */}
      <SchoolPoolDialog 
        open={showSchoolPool} 
        onOpenChange={setShowSchoolPool} 
        schoolPokemons={schoolPokemons} 
      />
    </div>;
};

export default StudentDashboard;
