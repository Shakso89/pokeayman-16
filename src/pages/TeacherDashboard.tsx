import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import ClassManagement from "@/components/teacher/class-management/ClassManagement";
import SchoolManagement from "@/components/teacher/SchoolManagement";
import DashboardHeader from "@/components/teacher/dashboard/DashboardHeader";
import AddStudentDialog from "@/components/teacher/dashboard/AddStudentDialog";
import MainDashboard from "@/components/teacher/dashboard/MainDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "classes">("main");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin" || username === "Ayman" || username === "Ayman_1";

  useEffect(() => {
    const loadTeacherData = async () => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        let { data: teacher, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', teacherId)
          .single();

        if (error) {
          console.warn("Teacher not found in database:", error);
          const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
          teacher = teachers.find((t: any) => t.id === teacherId);
          if (!teacher) {
            console.error("Teacher not found in localStorage either");
            return;
          }
        }

        setTeacherData(teacher);
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

  useEffect(() => {
    const handleSwitchToHomeworkTab = () => {
      console.log("Switching to homework tab from notification");
      setCurrentView("main");
      setActiveTab("homework");
    };

    window.addEventListener('switchToHomeworkTab', handleSwitchToHomeworkTab);
    
    return () => {
      window.removeEventListener('switchToHomeworkTab', handleSwitchToHomeworkTab);
    };
  }, []);

  const handleManageClasses = () => {
    console.log("Manage classes button clicked");
    setCurrentView("classes");
  };

  const handleNavigateToClass = (classId: string) => {
    console.log("TeacherDashboard - Navigating to class details:", classId);
    navigate(`/class-details/${classId}`);
  };

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-transparent"
    >
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
            <motion.div variants={itemVariants}>
              <DashboardHeader isAdmin={isAdmin} />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <MainDashboard
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onAddStudent={() => setIsAddStudentOpen(true)}
                onManageClasses={handleManageClasses}
                onNavigateToClass={handleNavigateToClass}
                onCreateClass={() => {}}
                teacherId={teacherId || ""}
                isAdmin={isAdmin}
              />
            </motion.div>
          </>
        ) : (
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
        )}
      </div>
      
      <AddStudentDialog
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        teacherId={teacherId}
        teacherData={teacherData}
        onTeacherDataUpdate={setTeacherData}
      />
    </motion.div>
  );
};

export default TeacherDashboard;
