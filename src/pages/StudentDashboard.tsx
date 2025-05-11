
import React from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";

// Import our components
import StudentHeader from "@/components/student/StudentHeader";
import StudentDashboardContent from "@/components/student/StudentDashboardContent";
import HeaderActions from "@/components/student/HeaderActions";

const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const classId = localStorage.getItem("studentClassId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "";
  const { t } = useTranslation();

  // Use our custom hook to manage dashboard state and logic
  const {
    studentPokemons,
    coins,
    schoolPokemons,
    activeBattles,
    avatar,
    showSchoolPool,
    setShowSchoolPool,
    isLoading,
    handlePokemonWon,
    handleCoinsWon,
    handleRefreshPool
  } = useStudentDashboard(studentId, classId, schoolId);
  
  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="student" userName={studentName} userAvatar={avatar || undefined} />
      
      <div className="container mx-auto py-8 px-4">
        <StudentHeader 
          studentName={studentName} 
          coins={coins} 
          activeBattles={activeBattles} 
          onOpenSchoolPool={() => setShowSchoolPool(true)} 
        />
        
        {/* Rankings button */}
        <HeaderActions />
        
        {/* Main Dashboard Content */}
        <StudentDashboardContent 
          studentName={studentName}
          studentId={studentId}
          classId={classId}
          studentPokemons={studentPokemons}
          schoolPokemons={schoolPokemons}
          coins={coins}
          activeBattles={activeBattles}
          showSchoolPool={showSchoolPool}
          setShowSchoolPool={setShowSchoolPool}
          isLoading={isLoading}
          handlePokemonWon={handlePokemonWon}
          handleCoinsWon={handleCoinsWon}
          handleRefreshPool={handleRefreshPool}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
