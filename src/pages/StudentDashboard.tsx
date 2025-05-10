
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getStudentPokemonCollection, 
  getSchoolPokemonPool,
  initializeSchoolPokemonPool,
  getDailyWheelPokemons
} from "@/utils/pokemon";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import PokemonWheelTab from "@/components/student/PokemonWheelTab";
import SchoolPoolDialog from "@/components/student/SchoolPoolDialog";

const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const classId = localStorage.getItem("studentClassId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "";
  const { t } = useTranslation();
  
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [schoolPokemons, setSchoolPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState("collection");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [wheelPokemon, setWheelPokemon] = useState<Pokemon[]>([]);
  const [isLoadingWheel, setIsLoadingWheel] = useState(false);
  
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

  useEffect(() => {
    if (activeTab === "wheel") {
      loadWheelPokemon();
    }
  }, [activeTab]);
  
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

  const loadWheelPokemon = () => {
    if (!schoolId) return;
    
    setIsLoadingWheel(true);
    console.log("Loading wheel pokemon for school:", schoolId);
    
    // Get daily wheel pokemons
    const dailyWheelPokemons = getDailyWheelPokemons(schoolId);
    console.log("Daily wheel pokemons:", dailyWheelPokemons);
    
    if (dailyWheelPokemons.length > 0) {
      setWheelPokemon(dailyWheelPokemons);
    } else {
      setWheelPokemon([]);
    }
    
    setIsLoadingWheel(false);
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
    loadStudentData();
    loadSchoolPokemonPool();
    loadWheelPokemon();
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
      
      <div className="container mx-auto py-8 px-4">
        <StudentHeader 
          studentName={studentName}
          coins={coins}
          activeBattles={activeBattles}
          onOpenSchoolPool={() => setShowSchoolPool(true)}
        />
        
        <Tabs defaultValue="collection" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="collection" className="text-lg">{t("my-collection") || "My Collection"}</TabsTrigger>
            <TabsTrigger value="wheel" className="text-lg">{t("pokemon-wheel") || "Pokémon Wheel"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="collection">
            <StudentCollection pokemons={studentPokemons} />
          </TabsContent>
          
          <TabsContent value="wheel">
            <PokemonWheelTab 
              wheelPokemons={wheelPokemon} 
              studentId={studentId}
              schoolId={schoolId}
              coins={coins}
              isLoadingWheel={isLoadingWheel}
              onPokemonWon={handlePokemonWon}
              onRefreshWheel={loadWheelPokemon}
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
