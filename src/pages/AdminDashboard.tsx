
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import AdminHeader from "@/components/admin/AdminHeader";
import TeachersTab, { AdminTeacherData } from "@/components/admin/TeachersTab"; // Updated import with type
import StudentsTab from "@/components/admin/StudentsTab";
import CreditManagement from "@/components/admin/CreditManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  // Check if current user is Admin
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin" || username === "Ayman";

  useEffect(() => {
    // Load data from Supabase
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('*');
          
        if (teachersError) throw teachersError;
        
        // Process teacher data
        const processedTeachers = await Promise.all((teachersData || []).map(async (teacher) => {
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
          
          return {
            ...teacher,
            numSchools: schoolsCount || 0,
            numStudents: studentsCount || 0,
            // Map Supabase fields to our interface
            displayName: teacher.display_name || teacher.username,
            createdAt: teacher.created_at,
            isActive: teacher.is_active !== false, // Default to true if not specified
          };
        }));
        
        setTeachers(processedTeachers);
        
        // Load students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) throw studentsError;
        
        setStudents(studentsData || []);
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isLoggedIn && isAdmin) {
      loadData();
    }
  }, [isLoggedIn, isAdmin]);

  // Redirect if not admin with username "Admin" or "Ayman"
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName="Admin" />
      
      <div className="container mx-auto py-8 px-4">
        <AdminHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="teachers">{t("teachers") || "Teachers"}</TabsTrigger>
            <TabsTrigger value="students">{t("students") || "Students"}</TabsTrigger>
            <TabsTrigger value="credits">{t("credits") || "Credits"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers" className="mt-0">
            {isLoading ? (
              <div className="text-center py-8">Loading teachers...</div>
            ) : (
              <TeachersTab teachers={teachers} setTeachers={setTeachers} t={t} />
            )}
          </TabsContent>
          
          <TabsContent value="students" className="mt-0">
            {isLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : (
              <StudentsTab students={students} setStudents={setStudents} t={t} />
            )}
          </TabsContent>
          
          <TabsContent value="credits" className="mt-0">
            <CreditManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
