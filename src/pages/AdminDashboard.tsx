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
}

const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [activeTab, setActiveTab] = useState("teachers");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, user, isAdmin } = useAuth();

  // Function to refresh the dashboard data from Supabase
  const refreshData = async () => {
    setIsLoading(true);
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
          const { count: studentsCount, error: countError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', teacher.id);
            
          if (countError) console.error("Error counting students:", countError);
          
          // Get teacher schools count
          const { count: schoolsCount, error: schoolsError } = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', teacher.id);
            
          if (schoolsError) console.error("Error counting schools:", schoolsError);
          
          // Properly type the subscription_type to ensure it matches AdminTeacherData
          const subscriptionType = (teacher.subscription_type || 'trial') as 'trial' | 'monthly' | 'annual';
          
          return {
            ...teacher,
            numSchools: schoolsCount || 0,
            numStudents: studentsCount || 0,
            // Map Supabase fields to our interface
            displayName: teacher.display_name || teacher.username,
            createdAt: teacher.created_at,
            isActive: teacher.is_active !== false, // Default to true if not specified
            lastLogin: teacher.last_login ? new Date(teacher.last_login).toLocaleString() : "Never",
            timeSpent: 0, // Currently not tracked
            expiryDate: teacher.expiry_date ? new Date(teacher.expiry_date).toLocaleDateString() : "-",
            subscriptionType // Now properly typed as 'trial' | 'monthly' | 'annual'
          };
        } catch (e) {
          console.error("Error processing teacher data:", e);
          return {
            ...teacher,
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
      
      setTeachers(processedTeachers as AdminTeacherData[]);
      
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
        time_spent: 0, // Currently not tracked
      }));
      
      setStudents(processedStudents);
    } catch (error: any) {
      console.error("Error loading data:", error);
      
      // Try loading from localStorage as a fallback
      try {
        const localTeachers = localStorage.getItem('teachers');
        const localStudents = localStorage.getItem('students');
        
        if (localTeachers) {
          const parsedTeachers = JSON.parse(localTeachers);
          const processedTeachers = parsedTeachers.map((teacher: any) => ({
            ...teacher,
            numSchools: 0,
            numStudents: 0,
            displayName: teacher.displayName || teacher.username,
            createdAt: teacher.createdAt,
            isActive: teacher.isActive !== false,
            lastLogin: "Unknown",
            timeSpent: 0,
            expiryDate: "-",
            subscriptionType: (teacher.subscriptionType || 'trial') as 'trial' | 'monthly' | 'annual'
          }));
          setTeachers(processedTeachers);
        }
        
        if (localStudents) {
          const parsedStudents = JSON.parse(localStudents);
          setStudents(parsedStudents);
        }
      } catch (localError) {
        console.error("Error loading from localStorage:", localError);
      }
      
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Using cached data if available.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      refreshData();
    }
  }, [isLoggedIn, isAdmin]);

  // Redirect if not admin
  if (!isLoggedIn) {
    return <Navigate to="/teacher-login" />;
  }

  // Special handling for specified admin accounts to ensure they always have access
  const userEmail = user?.email?.toLowerCase();
  const username = localStorage.getItem("teacherUsername") || "";
  const isAymanEmail = userEmail === "ayman.soliman.tr@gmail.com" || 
                       userEmail === "ayman.soliman.cc@gmail.com";
  const isAymanUsername = username === "Ayman" || username === "Admin";
  
  if (!isAdmin && !isAymanEmail && !isAymanUsername) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin dashboard.",
      variant: "destructive"
    });
    return <Navigate to="/teacher-dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName={isAymanEmail || isAymanUsername ? "Ayman" : "Admin"} />
      
      <div className="container mx-auto py-8 px-4">
        <AdminHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="teachers">{t("teachers") || "Teachers"}</TabsTrigger>
            <TabsTrigger value="students">{t("students") || "Students"}</TabsTrigger>
          </TabsList>
          
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
