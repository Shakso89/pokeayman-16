
import React from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import GlobalRankingDisplay from "@/components/ranking/GlobalRankingDisplay";

const StudentRankingPage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentId = localStorage.getItem("studentId");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentAvatar = localStorage.getItem("studentAvatar");

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="student" userName={studentName} userAvatar={studentAvatar} />
      
      <div className="container mx-auto py-8 px-4">
        <GlobalRankingDisplay currentStudentId={studentId || undefined} />
      </div>
    </div>
  );
};

export default StudentRankingPage;
