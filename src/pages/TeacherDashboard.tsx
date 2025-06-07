import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import ClassManagement from "@/components/teacher/class-management/ClassManagement";
import SchoolCollaboration from "@/components/teacher/SchoolCollaboration";
import SchoolManagement from "@/components/teacher/SchoolManagement";
import DashboardHeader from "@/components/teacher/dashboard/DashboardHeader";
import AddStudentDialog from "@/components/teacher/dashboard/AddStudentDialog";
import MainDashboard from "@/components/teacher/dashboard/MainDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "classes" | "collaboration">("main");
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
  const isAdmin = username === "Admin" || username === "Ayman";

  useEffect(() => {
    const loadTeacherData = async () => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        let { data: teacher, error } = await supabase
          .from("teachers")
          .select("*")
          .eq("id", teacherId)
          .single();

        if (error) {
          const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
          teacher = teachers.find((t: any) => t.id === teacherId);
          if (!teacher) return;
        }
        setTeacherData(teacher);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load teacher data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && userType === "teacher") loadTeacherData();
  }, [teacherId, username]);

  useEffect(() => {
    const handleSwitchToHomeworkTab = () => {
      setCurrentView("main");
      setActiveTab("homework");
    };
    window.addEventListener("switchToHomeworkTab", handleSwitchToHomeworkTab);
    return () => window.removeEventListener("switchToHomeworkTab", handleSwitchToHomeworkTab);
  }, []);

  const handleManageClasses = () => setCurrentView("classes");
  const handleNavigateToClass = (classId: string) => navigate(`/class/${classId}`);

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-md p-6">
                <DashboardHeader isAdmin={isAdmin} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-md p-6">
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
              </div>
            </motion.div>
          </>
        ) : currentView === "classes" ? (
          selectedSchoolId ? (
            <ClassManagement
              onBack={() => setSelectedSchoolId(null)}
              schoolId={selectedSchoolId}
              teacherId={teacherId || ""}
            />
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-md p-6">
              <SchoolManagement
                onBack={() => setCurrentView("main")}
                onSelectSchool={setSelectedSchoolId}
                teacherId={teacherId || ""}
              />
            </div>
          )
        ) : (
          <motion.div variants={itemVariants}>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-md p-6">
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
          </motion.div>
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
