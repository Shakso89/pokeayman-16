
import React, { useState, useEffect } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Package, Sword, Book } from "lucide-react";
import { useStudentData } from "@/hooks/useStudentData";
import { getSchoolAvailablePokemon, initializeSchoolPokemonPool } from "@/services/schoolPokemonService";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import MysteryBallTab from "@/components/student/MysteryBallTab";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import StudentDashboardButtons from "@/components/student/StudentDashboardButtons";
import StudentHomeworkTab from "@/components/student/StudentHomeworkTab";

const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "default-school-1";
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const { profile, pokemons, coins, spentCoins, isLoading: dataLoading, refreshData } = useStudentData(
    studentId, 
    undefined, 
    localStorage.getItem("studentName") || undefined
  );
  
  const [schoolPokemons, setSchoolPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(false);

  const studentClasses = profile?.class_id ? profile.class_id.split(',') : [];

  useEffect(() => {
    console.log("StudentDashboard loaded with:", {
      studentId,
      schoolId,
      profileClassId: profile?.class_id
    });

    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (studentId) {
      loadActiveBattles();
    }
    if (schoolId) {
      loadSchoolPokemonPool();
    }
  }, [studentId, schoolId, searchParams, profile?.class_id]);

  const loadSchoolPokemonPool = async () => {
    const currentSchoolId = schoolId || "default-school-1";
    console.log("Loading school pokemon pool for:", currentSchoolId);
    setIsLoadingPool(true);
    try {
      // First ensure the pool is initialized
      await initializeSchoolPokemonPool(currentSchoolId);
      
      // Then get available Pokemon
      const pool = await getSchoolAvailablePokemon(currentSchoolId);
      console.log("✅ Loaded school Pokemon pool:", pool.length);
      setSchoolPokemons(pool);
    } catch (error) {
      console.error("Error loading school pokemon pool:", error);
      setSchoolPokemons([]);
    } finally {
      setIsLoadingPool(false);
    }
  };

  const loadActiveBattles = () => {
    if (!studentId || !schoolId) return; 
    const studentClasses = profile?.class_id ? profile.class_id.split(',') : [];

    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];

    const relevantBattles = allBattles.filter((battle: any) => {
      const isSchoolMatch = battle.schoolId === schoolId;
      const isClassMatch = !battle.classId || studentClasses.includes(battle.classId);
      const isActive = battle.status === "active";
      const isNotExpired = new Date(battle.timeLimit).getTime() > Date.now();
      return isSchoolMatch && isClassMatch && isActive && isNotExpired;
    });
    setActiveBattles(relevantBattles);
  };

  const handlePokemonWon = (pokemon: Pokemon) => {
    console.log("Pokemon won:", pokemon);
    toast({
      title: t("congratulations"),
      description: t("new-pokemon-toast").replace("{pokemonName}", pokemon.name)
    });
    refreshData();
    loadSchoolPokemonPool();
  };

  const handleCoinsWon = (amount: number) => {
    console.log("Coins won:", amount);
    toast({
      title: t("congratulations"),
      description: t("coins-won-toast").replace("{amount}", amount.toString())
    });
    refreshData();
  };

  const handleRefreshPool = () => {
    setIsLoadingPool(true);
    setTimeout(() => {
      loadSchoolPokemonPool();
      setIsLoadingPool(false);
    }, 1000);
  };

  const handleMysteryBallClick = () => {
    setActiveTab("mystery-ball");
  };

  const handleCollectionClick = () => {
    setActiveTab("my-pokemons");
  };

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  const avatar = profile?.avatar_url || localStorage.getItem("studentAvatar") || undefined;

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="student" userName={profile?.display_name || studentName} userAvatar={avatar} />
      
      <div className="container mx-auto py-8 px-4">
        <StudentHeader 
          studentName={profile?.display_name || studentName} 
          coins={coins} 
          activeBattles={activeBattles} 
          onOpenSchoolPool={() => setShowSchoolPool(true)} 
        />
        
        <div className="flex justify-end mt-4">
          <Link to="/student/rankings">
            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-full shadow-md border-2 border-orange-300 flex items-center gap-2 transform hover:scale-105 transition-all">
              <Trophy className="h-5 w-5" />
              {t("rankings")}
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 relative">
          <Tabs defaultValue="home" className="w-full mt-8" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8 p-2 rounded-full bg-transparent">
              <TabsTrigger value="home" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all">
                {t("home-tab")}
              </TabsTrigger>
              <TabsTrigger value="my-classes" className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all flex items-center justify-center gap-2">
                <Book className="h-5 w-5" />
                Homework
              </TabsTrigger>
              <TabsTrigger value="my-pokemons" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all">
                {t("my-pokemon-tab")}
              </TabsTrigger>
              <TabsTrigger value="mystery-ball" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-full px-6 py-3 font-bold text-lg transition-all flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                {t("mystery-ball-tab")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="home" className="mt-4">
              <StudentDashboardButtons
                coins={coins}
                studentId={studentId}
                onMysteryBallClick={handleMysteryBallClick}
                onCollectionClick={handleCollectionClick}
              />
            </TabsContent>

            <TabsContent value="my-classes" className="mt-4">
              {studentClasses.length > 0 ? (
                <StudentHomeworkTab 
                  studentId={studentId}
                  studentName={studentName}
                  classIds={studentClasses}
                />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">You are not enrolled in any class yet, so you can't see homework assignments.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="my-pokemons" className="mt-4">
              {dataLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-500">{t("loading-collection")}</div>
                </div>
              ) : (
                <StudentCollection studentId={studentId} />
              )}
            </TabsContent>
            
            <TabsContent value="mystery-ball" className="mt-4">
              <MysteryBallTab 
                schoolPokemons={schoolPokemons} 
                studentId={studentId} 
                schoolId={schoolId} 
                coins={coins} 
                isLoading={isLoadingPool} 
                onPokemonWon={handlePokemonWon} 
                onCoinsWon={handleCoinsWon} 
                onRefreshPool={handleRefreshPool}
                onDataRefresh={refreshData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <SchoolPokemonPoolDialog 
        isOpen={showSchoolPool} 
        onOpenChange={setShowSchoolPool} 
        schoolId={schoolId}
      />
    </div>
  );
};

export default StudentDashboard;
