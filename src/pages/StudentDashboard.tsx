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

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import MysteryBallTab from "@/components/student/MysteryBallTab";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import StudentDashboardButtons from "@/components/student/StudentDashboardButtons";
import StudentHomeworkTab from "@/components/student/StudentHomeworkTab";
import ShopTab from "@/components/student/ShopTab";
import UnifiedMysteryBallTab from "@/components/student/UnifiedMysteryBallTab";
import UnifiedShopTab from "@/components/student/UnifiedShopTab";

const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "default-school-1";
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const { studentInfo, pokemon: pokemons, loading: dataLoading, error } = useStudentData(studentId);
  
  const [activeTab, setActiveTab] = useState("home");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(false);

  // Extract profile data from studentInfo
  const profile = studentInfo;
  const coins = studentInfo?.coins || 0;
  const spentCoins = 0; // This would need to be calculated if needed

  // Parse class IDs - handle both single class and comma-separated classes
  const studentClasses = profile?.class_id ? 
    (typeof profile.class_id === 'string' ? profile.class_id.split(',').filter(Boolean) : [profile.class_id]) 
    : [];

  console.log("Student classes parsed:", { 
    rawClassId: profile?.class_id, 
    parsedClasses: studentClasses,
    studentInfo: profile 
  });

  const refreshData = () => {
    // This would trigger a re-fetch of student data
    window.location.reload();
  };

  useEffect(() => {
    console.log("StudentDashboard loaded with:", {
      studentId,
      schoolId,
      profileClassId: profile?.class_id,
      parsedClasses: studentClasses
    });

    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (studentId) {
      loadActiveBattles();
    }
  }, [studentId, schoolId, searchParams, profile?.class_id]);

  const loadActiveBattles = () => {
    if (!studentId || !schoolId) return; 

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
      setIsLoadingPool(false);
    }, 1000);
  };

  const handleMysteryBallClick = () => {
    setActiveTab("mystery-ball");
  };

  const handleCollectionClick = () => {
    setActiveTab("my-pokemons");
  };

  const handleShopClick = () => {
    setActiveTab("shop");
  };

  const handlePurchaseComplete = () => {
    refreshData();
  };

  const handleHomeworkClick = () => {
    setActiveTab("my-classes");
  };

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  const avatar = profile?.avatar_url || localStorage.getItem("studentAvatar") || undefined;

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="student" userName={profile?.display_name || studentName} userAvatar={avatar} />
      
      <div className="container mx-auto py-4 md:py-8 px-2 md:px-4">
        <StudentHeader 
          studentName={profile?.display_name || studentName} 
          coins={coins} 
          activeBattles={activeBattles} 
          onOpenSchoolPool={() => setShowSchoolPool(true)} 
        />
        
        <div className="flex justify-end mt-4">
          <Link to="/student-ranking">
            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm md:text-lg rounded-full shadow-md border-2 border-orange-300 flex items-center gap-2 transform hover:scale-105 transition-all">
              <Trophy className="h-4 w-4 md:h-5 md:w-5" />
              {t("rankings")}
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 md:mt-6 relative">
          <Tabs defaultValue="home" className="w-full mt-4 md:mt-8" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-4 md:mb-8 p-1 md:p-2 rounded-full bg-transparent">
              <TabsTrigger value="home" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-full px-2 md:px-6 py-2 md:py-3 font-bold text-xs md:text-lg transition-all">
                {t("home-tab")}
              </TabsTrigger>
              <TabsTrigger value="my-classes" className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-full px-2 md:px-6 py-2 md:py-3 font-bold text-xs md:text-lg transition-all flex items-center justify-center gap-1 md:gap-2">
                <Book className="h-3 w-3 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Homework</span>
                <span className="sm:hidden">HW</span>
              </TabsTrigger>
              <TabsTrigger value="my-pokemons" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-full px-2 md:px-6 py-2 md:py-3 font-bold text-xs md:text-lg transition-all">
                <span className="hidden sm:inline">{t("my-pokemon-tab")}</span>
                <span className="sm:hidden">Pokémon</span>
              </TabsTrigger>
              <TabsTrigger value="mystery-ball" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-full px-2 md:px-6 py-2 md:py-3 font-bold text-xs md:text-lg transition-all flex items-center justify-center gap-1 md:gap-2">
                <Package className="h-3 w-3 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t("mystery-ball-tab")}</span>
                <span className="sm:hidden">Ball</span>
              </TabsTrigger>
              <TabsTrigger value="shop" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-full px-2 md:px-6 py-2 md:py-3 font-bold text-xs md:text-lg transition-all">
                <span className="hidden sm:inline">Shop</span>
                <span className="sm:hidden">💰</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="home" className="mt-4">
              <StudentDashboardButtons
                coins={coins}
                studentId={studentId}
                onMysteryBallClick={handleMysteryBallClick}
                onCollectionClick={handleCollectionClick}
                onShopClick={handleShopClick}
                onHomeworkClick={handleHomeworkClick}
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
                    <p className="text-sm text-gray-400 mt-2">
                      Debug info: Profile class_id = {profile?.class_id || 'null'}, 
                      Parsed classes = {JSON.stringify(studentClasses)}
                    </p>
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
              <UnifiedMysteryBallTab 
                studentId={studentId} 
                onDataUpdate={refreshData}
              />
            </TabsContent>

            <TabsContent value="shop" className="mt-4">
              <UnifiedShopTab
                studentId={studentId}
                studentCoins={coins}
                onDataUpdate={refreshData}
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
