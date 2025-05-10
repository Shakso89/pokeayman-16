
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getStudentPokemonCollection, 
  getSchoolPokemonPool,
  initializeSchoolPokemonPool,
  awardCoinsToStudent
} from "@/utils/pokemon";
import { Pokemon } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import MysteryBallTab from "@/components/student/MysteryBallTab";
import SchoolPoolDialog from "@/components/student/SchoolPoolDialog";

const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const classId = localStorage.getItem("studentClassId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "";
  const { toast } = useToast();
  
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [schoolPokemons, setSchoolPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState("collection");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log("StudentDashboard loaded with:", { studentId, classId, schoolId });
    
    if (studentId) {
      loadStudentData();
      loadActiveBattles();
    }
    
    if (schoolId) {
      loadSchoolPokemonPool();
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
    console.log("Loading school pokemon pool for:", schoolId);
    // Initialize the school pool if it doesn't exist
    const pool = initializeSchoolPokemonPool(schoolId);
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
      const isRelevant = (battle.schoolId === schoolId && (!battle.classId || battle.classId === classId));
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
      title: "Congratulations!",
      description: `You got a new Pokémon: ${pokemon.name}`
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
      title: "Congratulations!",
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

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="student" 
        userName={studentName} 
        userAvatar={avatar || undefined}
      />
      
      {/* Decorative Pokemon images */}
      <div className="fixed top-20 right-5 z-0 opacity-40">
        <img
          src="/lovable-uploads/431ab8c1-ab7f-46cb-9baa-23f56a99d043.png"
          alt="Ash with Pikachu"
          className="w-40 h-auto"
        />
      </div>
      
      <div className="fixed bottom-10 left-5 z-0 opacity-40">
        <img
          src="/lovable-uploads/850bf892-0b85-435a-8bd6-9ba28ebc89aa.png"
          alt="Pokemon starters"
          className="w-40 h-auto"
        />
      </div>
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <StudentHeader 
          studentName={studentName}
          coins={coins}
          activeBattles={activeBattles}
          onOpenSchoolPool={() => setShowSchoolPool(true)}
        />
        
        <Tabs defaultValue="collection" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="collection" className="text-lg">My Collection</TabsTrigger>
            <TabsTrigger value="mysteryball" className="text-lg">Mystery Ball</TabsTrigger>
          </TabsList>
          
          <TabsContent value="collection">
            <StudentCollection pokemons={studentPokemons} />
          </TabsContent>
          
          <TabsContent value="mysteryball">
            <MysteryBallTab 
              schoolPokemons={schoolPokemons} 
              studentId={studentId}
              schoolId={schoolId}
              coins={coins}
              isLoading={isLoading}
              onPokemonWon={handlePokemonWon}
              onCoinsWon={handleCoinsWon}
              onRefreshPool={handleRefreshPool}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <SchoolPoolDialog 
        open={showSchoolPool} 
        onOpenChange={setShowSchoolPool} 
        schoolPokemons={schoolPokemons}
      />
    </div>
  );
};

export default StudentDashboard;
