
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import AdminHeader from "@/components/admin/AdminHeader";
import TeachersTab from "@/components/admin/TeachersTab";
import { AdminTeacherData } from "@/types/admin";
import StudentsTab from "@/components/admin/StudentsTab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/card";

const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [activeTab, setActiveTab] = useState("teachers");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, user, isAdmin } = useAuth();

  // Type for student data
  interface StudentData {
    id: string;
    username: string;
    display_name: string;
    teacher_id: string;
    created_at: string;
    last_login?: string;
    time_spent?: number; // in minutes
    is_active: boolean;
    password?: string;
    password_hash?: string;
  }

  // Function to refresh the dashboard data with better error handling
  const refreshData = async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    try {
      // First try loading from localStorage as a quick start (temp data)
      let localTeachersLoaded = false;
      let localStudentsLoaded = false;
      
      try {
        const localTeachers = localStorage.getItem('teachers');
        const localStudents = localStorage.getItem('students');
        
        if (localTeachers) {
          const parsedTeachers = JSON.parse(localTeachers);
          const processedTeachers = parsedTeachers.map((teacher: any) => ({
            ...teacher,
            numSchools: 0,
            numStudents: 0,
            displayName: teacher.display_name || teacher.displayName || teacher.username,
            createdAt: teacher.created_at || teacher.createdAt,
            isActive: teacher.is_active !== false,
            lastLogin: teacher.last_login ? new Date(teacher.last_login).toLocaleString() : "Never",
            timeSpent: 0,
            expiryDate: teacher.expiry_date ? new Date(teacher.expiry_date).toLocaleDateString() : "-",
            subscriptionType: (teacher.subscription_type || 'trial') as 'trial' | 'monthly' | 'annual'
          }));
          setTeachers(processedTeachers);
          localTeachersLoaded = true;
        }
        
        if (localStudents) {
          const parsedStudents = JSON.parse(localStudents);
          setStudents(parsedStudents);
          localStudentsLoaded = true;
        }
      } catch (localError) {
        console.error("Error loading from localStorage:", localError);
      }

      // Try to load from Supabase (will replace the localStorage data)
      try {
        // Load teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('*');
          
        if (teachersError) {
          console.error("Error loading teachers:", teachersError);
          throw teachersError;
        }
        
        // Process teacher data
        const processedTeachers = await Promise.all((teachersData || []).map(async (teacher) => {
          try {
            // Get teacher students count
            let studentsCount = 0;
            let schoolsCount = 0;
            
            try {
              const { count, error: countError } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('teacher_id', teacher.id);
                
              if (countError) console.error("Error counting students:", countError);
              else studentsCount = count || 0;
              
              // Get teacher schools count
              const { count: schoolCount, error: schoolsError } = await supabase
                .from('schools')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', teacher.id);
                
              if (schoolsError) console.error("Error counting schools:", schoolsError);
              else schoolsCount = schoolCount || 0;
            } catch (e) {
              console.error("Error fetching counts:", e);
            }
            
            const subscriptionType = (teacher.subscription_type || 'trial') as 'trial' | 'monthly' | 'annual';
            
            return {
              ...teacher,
              id: teacher.id,
              numSchools: schoolsCount,
              numStudents: studentsCount,
              displayName: teacher.display_name || teacher.username,
              createdAt: teacher.created_at,
              isActive: teacher.is_active !== false, 
              lastLogin: teacher.last_login ? new Date(teacher.last_login).toLocaleString() : "Never",
              timeSpent: 0, 
              expiryDate: teacher.expiry_date ? new Date(teacher.expiry_date).toLocaleDateString() : "-",
              subscriptionType
            };
          } catch (e) {
            console.error("Error processing teacher data:", e);
            return {
              ...teacher,
              id: teacher.id,
              numSchools: 0,
              numStudents: 0,
              displayName: teacher.display_name || teacher.username,
              createdAt: teacher.created_at,
              isActive: teacher.is_active !== false,
              lastLogin: teacher.last_login ? new Date(teacher.last_login).toLocaleString() : "Never",
              timeSpent: 0,
              expiryDate: teacher.expiry_date ? new Date(teacher.expiry_date).toLocaleDateString() : "-",
              subscriptionType: (teacher.subscription_type || 'trial') as 'trial' | 'monthly' | 'annual'
            };
          }
        }));
        
        setTeachers(processedTeachers);
        localTeachersLoaded = true;
        
        // Load students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) {
          console.error("Error loading students:", studentsError);
          throw studentsError;
        }
        
        const processedStudents = (studentsData || []).map(student => ({
          ...student,
          time_spent: 0,
        }));
        
        setStudents(processedStudents);
        localStudentsLoaded = true;
      } catch (supabaseError: any) {
        console.error("Error loading data from Supabase:", supabaseError);
        
        if (!localTeachersLoaded || !localStudentsLoaded) {
          setLoadingError(`Failed to load data: ${supabaseError.message || "Unknown error"}`);
        }
      }
    } catch (error: any) {
      console.error("Error in refreshData:", error);
      setLoadingError(`Failed to load dashboard data: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to load data on component mount and when auth changes
  useEffect(() => {
    // Check if we're on admin dashboard but load data regardless of auth state
    // to avoid infinite loading if auth context is slow to initialize
    refreshData();
    
    // Set up an interval to retry loading if needed
    const retryInterval = setInterval(() => {
      if (teachers.length === 0 && students.length === 0) {
        console.log("Retry loading admin dashboard data...");
        refreshData();
      } else {
        clearInterval(retryInterval);
      }
    }, 5000); // Retry every 5 seconds if no data
    
    return () => clearInterval(retryInterval);
  }, []);

  // Separate effect that checks auth status
  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      // User is logged in but not admin, redirect to teacher dashboard
      navigate("/teacher-dashboard");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Special handling for specified admin accounts to ensure they always have access
  const userEmail = user?.email?.toLowerCase();
  const username = localStorage.getItem("teacherUsername") || "";
  const storedEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
  
  const isAymanEmail = userEmail === "ayman.soliman.tr@gmail.com" || 
                      userEmail === "ayman.soliman.cc@gmail.com" ||
                      storedEmail === "ayman.soliman.tr@gmail.com" ||
                      storedEmail === "ayman.soliman.cc@gmail.com";
                       
  const isAymanUsername = username === "Ayman" || username === "Admin";
  
  // Manual override for admin access - use this instead of waiting for auth context
  const hasAdminAccess = isAdmin || isAymanEmail || isAymanUsername;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName={isAymanEmail || isAymanUsername ? "Ayman" : "Admin"} />
      
      <div className="container mx-auto py-8 px-4">
        <AdminHeader />
        
        <div className="mb-6 flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="teachers">{t("teachers") || "Teachers"}</TabsTrigger>
              <TabsTrigger value="students">{t("students") || "Students"}</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={refreshData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Data
          </Button>
        </div>
        
        {loadingError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{loadingError}</p>
                  <p className="mt-1">Using cached data if available. Try refreshing the page or clicking the refresh button above.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        <TabsContent value="teachers" className="mt-0">
          {isLoading ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Loader2 className="h-8 w-8 mb-2 animate-spin text-blue-500" />
              <p>Loading teachers...</p>
            </div>
          ) : (
            <TeachersTab teachers={teachers} setTeachers={setTeachers} t={t} />
          )}
        </TabsContent>
        
        <TabsContent value="students" className="mt-0">
          {isLoading ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Loader2 className="h-8 w-8 mb-2 animate-spin text-blue-500" />
              <p>Loading students...</p>
            </div>
          ) : (
            <StudentsTab students={students} setStudents={setStudents} t={t} />
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default AdminDashboard;
