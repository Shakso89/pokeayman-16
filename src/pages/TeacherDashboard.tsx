
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import ClassManagement from "@/components/teacher/ClassManagement";
import SchoolCollaboration from "@/components/teacher/SchoolCollaboration";
import SchoolManagement from "@/components/teacher/SchoolManagement";
import { initializeTeacherCredits, getTeacherCredits } from "@/utils/creditService";
import DashboardHeader from "@/components/teacher/dashboard/DashboardHeader";
import AddStudentDialog from "@/components/teacher/dashboard/AddStudentDialog";
import MainDashboard from "@/components/teacher/dashboard/MainDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "classes" | "collaboration">("main");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [creditInfo, setCreditInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin" || username === "Ayman";

  useEffect(() => {
    // Load teacher data from Supabase
    const loadTeacherData = async () => {
      if (!teacherId) return;
      
      setIsLoading(true);
      try {
        // Get teacher profile
        let { data: teacher, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', teacherId)
          .single();
          
        if (error) {
          // If teacher doesn't exist in Supabase yet, use local data
          console.warn("Teacher not found in database:", error);
          const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
          teacher = teachers.find((t: any) => t.id === teacherId);
          
          if (!teacher) {
            console.error("Teacher not found in localStorage either");
            return;
          }
        }
        
        setTeacherData(teacher);
        
        // Initialize teacher credits
        const displayName = teacher.display_name || username;
        await initializeTeacherCredits(teacherId, username, displayName);
        
        // Get teacher credits
        const { data: creditData, error: creditError } = await supabase
          .from('teacher_credits')
          .select('*')
          .eq('teacher_id', teacherId)
          .single();
          
        if (creditError) {
          console.error("Error loading credits:", creditError);
          // Fall back to local credit service
          const credits = getTeacherCredits(teacherId);
          setCreditInfo(credits);
        } else {
          setCreditInfo(creditData);
        }
      } catch (error: any) {
        console.error("Error loading teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to load teacher data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isLoggedIn && userType === "teacher") {
      loadTeacherData();
    }
  }, [teacherId, username, isLoggedIn, userType]);

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="teacher" 
        userName={teacherData?.display_name || username || "Teacher"} 
        userAvatar={teacherData?.avatar_url}
      />
      
      <div className="container mx-auto py-8 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        ) : currentView === "main" ? (
          <>
            <DashboardHeader isAdmin={isAdmin} />
            
            <MainDashboard 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onAddStudent={() => setIsAddStudentOpen(true)}
              onManageClasses={() => setCurrentView("classes")}
              teacherId={teacherId}
              creditInfo={creditInfo}
              isAdmin={isAdmin}
            />
          </>
        ) : currentView === "classes" ? (
          selectedSchoolId ? (
            <ClassManagement 
              onBack={() => setSelectedSchoolId(null)}
              schoolId={selectedSchoolId}
              teacherId={teacherId || ""}
            />
          ) : (
            <SchoolManagement 
              onBack={() => setCurrentView("main")} 
              onSelectSchool={(schoolId) => setSelectedSchoolId(schoolId)}
              teacherId={teacherId || ""}
            />
          )
        ) : (
          <div>
            <div className="flex items-center mb-6">
              <Button variant="outline" onClick={() => setCurrentView("main")} className="mr-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("back-to-dashboard")}
              </Button>
              <h2 className="text-2xl font-bold">{t("school-collaboration")}</h2>
            </div>
            
            <SchoolCollaboration 
              teacherId={teacherId || ""} 
              teacherName={teacherData?.display_name || username || "Teacher"} 
            />
          </div>
        )}
      </div>
      
      <AddStudentDialog 
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        teacherId={teacherId}
        teacherData={teacherData}
        onTeacherDataUpdate={setTeacherData}
      />
    </div>
  );
};

export default TeacherDashboard;
