import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trophy, Book } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getStudentCoinsEnhanced } from "@/services/enhancedCoinService";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import StudentDashboardButtons from "@/components/student/StudentDashboardButtons";
import StudentHomeworkTab from "@/components/student/StudentHomeworkTab";
import UnifiedShopTab from "@/components/student/UnifiedShopTab";

const StudentDashboard: React.FC = () => {
  const { isLoggedIn, userType, isAdmin, loading } = useAuth();
  
  // Get the actual student ID from localStorage
  const storedStudentId = localStorage.getItem("studentId");
  const studentId = storedStudentId || "";
  const studentName = localStorage.getItem("studentName") || localStorage.getItem("studentUsername") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "default-school-1";
  
  console.log("StudentDashboard auth state:", {
    isLoggedIn,
    userType,
    isAdmin,
    studentId,
    studentName,
    storedStudentId
  });
  
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("home");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [coins, setCoins] = useState(0);
  const [studentClasses, setStudentClasses] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Enhanced data loading function with better error handling
  const loadStudentData = useCallback(async () => {
    if (!studentId || studentId === 'undefined') {
      console.log("No valid student ID, skipping data load");
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      console.log("🔄 Loading enhanced student data for:", studentId);

      // Get student profile from unified source
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', studentId)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Error loading student profile:", profileError);
        // Fallback to students table
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', studentId)
          .maybeSingle();

        if (!studentError && studentData) {
          setStudentInfo(studentData);
          setCoins(studentData.coins || 0);
          setStudentClasses(studentData.class_id ? [studentData.class_id] : []);
        }
      } else if (profileData) {
        setStudentInfo(profileData);
        setCoins(profileData.coins || 0);
        setStudentClasses(profileData.class_id ? [profileData.class_id] : []);
      }

      // Also get coins using enhanced service for accuracy
      const coinAmount = await getStudentCoinsEnhanced(studentId);
      setCoins(coinAmount);

      console.log("✅ Student data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  }, [studentId, toast]);

  // Initial data load
  useEffect(() => {
    if (studentId && studentId !== 'undefined') {
      loadStudentData();
    } else {
      setDataLoading(false);
    }
  }, [loadStudentData, studentId]);

  // Enhanced real-time subscription for data changes
  useEffect(() => {
    if (!studentId || studentId === 'undefined') return;

    console.log("🔄 Setting up enhanced real-time subscriptions for:", studentId);

    // Subscribe to student profile changes
    const profileChannel = supabase
      .channel('student-dashboard-profile')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_profiles',
          filter: `user_id=eq.${studentId}`
        },
        (payload) => {
          console.log('🔄 Real-time profile update:', payload);
          loadStudentData();
          setRefreshKey(prev => prev + 1);
        }
      )
      .subscribe();

    // Subscribe to Pokemon collection changes
    const pokemonChannel = supabase
      .channel('student-dashboard-pokemon')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_pokemon_collection',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          console.log('🔄 Real-time Pokemon update:', payload);
          loadStudentData();
          setRefreshKey(prev => prev + 1);
        }
      )
      .subscribe();

    // Subscribe to coin history changes
    const coinChannel = supabase
      .channel('student-dashboard-coins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coin_history',
          filter: `user_id=eq.${studentId}`
        },
        (payload) => {
          console.log('🔄 Real-time coin update:', payload);
          loadStudentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(pokemonChannel);
      supabase.removeChannel(coinChannel);
    };
  }, [studentId, loadStudentData]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (studentId) {
      loadActiveBattles();
    }
  }, [studentId, schoolId, searchParams]);

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

  const handleRefreshPool = () => {
    setIsLoadingPool(true);
    setTimeout(() => {
      setIsLoadingPool(false);
    }, 1000);
  };

  const handleCollectionClick = () => {
    setActiveTab("my-pokemons");
  };

  const handleShopClick = () => {
    setActiveTab("shop");
  };

  const handlePurchaseComplete = () => {
    console.log("🔄 Purchase completed, refreshing data...");
    loadStudentData(); // Refresh all data after purchase
    setRefreshKey(prev => prev + 1); // Force component refresh
  };

  const handleHomeworkClick = () => {
    setActiveTab("my-classes");
  };

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Check authentication - allow admin override for student dashboard
  if (!isLoggedIn) {
    console.log("StudentDashboard: Not logged in, redirecting to login");
    return <Navigate to="/student-login" />;
  }

  // If not a student and not an admin, redirect to appropriate dashboard
  if (userType !== "student" && !isAdmin) {
    console.log("StudentDashboard: Not a student and not admin, redirecting to teacher dashboard");
    return <Navigate to="/teacher-dashboard" />;
  }

  // If no valid student ID, show error
  if (!studentId || studentId === 'undefined') {
    return (
      <div className="min-h-screen bg-transparent">
        <NavBar userType="student" userName="Guest" />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">No student profile found.</p>
              {isAdmin && (
                <p className="text-sm text-blue-600">
                  As an admin, you may need to select a specific student to view their dashboard.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const avatar = studentInfo?.avatar_url || localStorage.getItem("studentAvatar") || undefined;

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="student" userName={studentInfo?.display_name || studentName} userAvatar={avatar} />
      
      <div className="container mx-auto py-4 md:py-8 px-2 md:px-4">
        <StudentHeader 
          studentName={studentInfo?.display_name || studentName} 
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
            <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-8 p-1 md:p-2 rounded-full bg-transparent">
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
              <TabsTrigger value="shop" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-full px-2 md:px-6 py-2 md:py-3 font-bold text-xs md:text-lg transition-all">
                <span className="hidden sm:inline">Shop</span>
                <span className="sm:hidden">💰</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="home" className="mt-4">
              <StudentDashboardButtons
                coins={coins}
                studentId={studentId}
                onCollectionClick={() => setActiveTab("my-pokemons")}
                onShopClick={() => setActiveTab("shop")}
                onHomeworkClick={() => setActiveTab("my-classes")}
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
                <StudentCollection 
                  studentId={studentId} 
                  key={`collection-${refreshKey}`}
                />
              )}
            </TabsContent>

            <TabsContent value="shop" className="mt-4">
              <UnifiedShopTab
                studentId={studentId}
                studentCoins={coins}
                onDataUpdate={handlePurchaseComplete}
                key={`shop-${refreshKey}`}
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
