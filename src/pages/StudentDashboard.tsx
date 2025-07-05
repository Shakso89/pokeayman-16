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
import { robustSupabaseQuery, getNetworkStatus } from "@/services/networkService";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentCollection from "@/components/student/StudentCollection";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import StudentDashboardButtons from "@/components/student/StudentDashboardButtons";
import StudentHomeworkTab from "@/components/student/StudentHomeworkTab";
import UnifiedShopTab from "@/components/student/UnifiedShopTab";

const StudentDashboard: React.FC = () => {
  const { isLoggedIn, userType, isAdmin, loading } = useAuth();
  
  // Get the actual student ID from localStorage or use auth.uid()
  const storedStudentId = localStorage.getItem("studentId");
  
  // Get current user from Supabase auth
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);
  
  // Use auth.uid() if available, otherwise fall back to localStorage
  const studentId = currentUser?.id || storedStudentId || "";
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
  const [networkIssue, setNetworkIssue] = useState(false);

  // Enhanced data loading function with better error handling
  const loadStudentData = useCallback(async () => {
    if (!studentId || studentId === 'undefined') {
      console.log("No valid student ID, skipping data load");
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      setNetworkIssue(false);
      console.log("🔄 Loading enhanced student data for:", studentId);

      // Check network status first
      const networkStatus = getNetworkStatus();
      if (!networkStatus.isOnline) {
        console.warn("📡 No internet connection");
        setNetworkIssue(true);
        setDataLoading(false);
        return;
      }

      // Get student profile with robust error handling
      const profileResult = await robustSupabaseQuery(async () => {
        const result = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', studentId)
          .maybeSingle();
        return result;
      });

      if (profileResult.networkIssue) {
        console.error("🌐 Network connectivity issue detected");
        setNetworkIssue(true);
        setDataLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = profileResult;

      if (profileError) {
        console.error("❌ Error loading student profile:", profileError);
        
        // Fallback to students table if profile not found
        const studentResult = await robustSupabaseQuery(async () => {
          const result = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .maybeSingle();
          return result;
        });

        if (studentResult.networkIssue) {
          console.error("🌐 Students table query failed due to network issue");
          setNetworkIssue(true);
          setDataLoading(false);
          return;
        }

        const { data: studentData, error: studentError } = studentResult;

        if (!studentError && studentData) {
          // Type assertion for studentData
          const student = studentData as any;
          
          // Sync to student_profiles for future use
          const { data: syncedProfile } = await supabase
            .from('student_profiles')
            .upsert({
              user_id: student.user_id || student.id,
              username: student.username,
              display_name: student.display_name || student.username,
              coins: student.coins || 0,
              spent_coins: 0,
              school_id: student.school_id,
              class_id: student.class_id,
              teacher_id: student.teacher_id,
              avatar_url: student.profile_photo,
              school_name: student.school_name
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          setStudentInfo(syncedProfile || student);
          setCoins(student.coins || 0);
          setStudentClasses(student.class_id ? [student.class_id] : []);
        }
      } else if (profileData) {
        const profile = profileData as any;
        setStudentInfo(profile);
        setCoins(profile.coins || 0);
        setStudentClasses(profile.class_id ? [profile.class_id] : []);
      }

      // Get accurate coin amount
      try {
        const coinAmount = await getStudentCoinsEnhanced(studentId);
        setCoins(coinAmount);
      } catch (coinError) {
        console.warn("Could not get enhanced coins, using profile coins");
      }

      console.log("✅ Student data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading student data:", error);
      setNetworkIssue(true);
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting to the server. Please check your internet connection.",
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
          // Avoid infinite loops by only refreshing on actual changes
          if (payload.eventType !== 'UPDATE' || payload.new !== payload.old) {
            loadStudentData();
            setRefreshKey(prev => prev + 1);
          }
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
    loadStudentData();
    setRefreshKey(prev => prev + 1);
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
        {networkIssue && (
          <Card className="mb-4 border-yellow-500 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <span>⚠️</span>
                <span>Connection issue detected. Some features may not work properly. Please check your internet connection.</span>
              </div>
            </CardContent>
          </Card>
        )}
        
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
