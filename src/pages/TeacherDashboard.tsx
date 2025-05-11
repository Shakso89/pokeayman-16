
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import ClassManagement from "@/components/teacher/ClassManagement";
import SchoolManagement from "@/components/teacher/SchoolManagement";
import TeacherDashboardHeader from "@/components/teacher/TeacherDashboardHeader";
import TeacherDashboardCards from "@/components/teacher/TeacherDashboardCards";
import AddStudentDialog from "@/components/teacher/AddStudentDialog";
import CollaborationView from "@/components/teacher/CollaborationView";

const TeacherDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<"main" | "classes" | "collaboration">("main");
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin";

  useEffect(() => {
    // Load teacher data
    if (teacherId) {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => t.id === teacherId);
      if (teacher) {
        setTeacherData(teacher);
      }
    }
  }, [teacherId]);

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="teacher" 
        userName={teacherData?.displayName || username || "Teacher"} 
        userAvatar={teacherData?.avatar}
      />
      
      <div className="container mx-auto py-8 px-4">
        {currentView === "main" ? (
          <>
            <TeacherDashboardHeader isAdmin={isAdmin} />
            
            <AddStudentDialog 
              teacherId={teacherId} 
              teacherData={teacherData}
              setTeacherData={setTeacherData}
            />
            
            <TeacherDashboardCards 
              onManageClassesClick={() => setCurrentView("classes")}
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
          <CollaborationView 
            onBack={() => setCurrentView("main")}
            teacherId={teacherId || ""}
            teacherName={teacherData?.displayName || username || "Teacher"}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
