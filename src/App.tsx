import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Index } from "@/pages/Index";
import { TeacherLogin } from "@/pages/TeacherLogin";
import { TeacherSignup } from "@/pages/TeacherSignup";
import { StudentLogin } from "@/pages/StudentLogin";
import { StudentDashboard } from "@/pages/StudentDashboard";
import { TeacherDashboard } from "@/pages/TeacherDashboard";
import { ClassManagement } from "@/pages/teacher/ClassManagement";
import { SchoolManagement } from "@/pages/teacher/SchoolManagement";
import { StudentManagement } from "@/pages/teacher/StudentManagement";
import { StudentProfilePage } from "@/pages/StudentProfilePage";
import { TeacherProfilePage } from "@/pages/TeacherProfilePage";
import { StudentRankings } from "@/pages/StudentRankings";
import { StudentSignup } from "@/pages/StudentSignup";

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'teacher' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { isLoggedIn, loading, refreshAuthState } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading) {
      refreshAuthState();
    }
  }, [loading, refreshAuthState]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const expectedUserType = localStorage.getItem("userType");

  if (!isLoggedIn || expectedUserType !== userType) {
    const redirectPath = userType === 'teacher' ? '/teacher-login' : '/student-login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Authentication Routes */}
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-signup" element={<TeacherSignup />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute userType="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute userType="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/class-management/:teacherId" element={
          <ProtectedRoute userType="teacher">
            <ClassManagement />
          </ProtectedRoute>
        } />
        <Route path="/teacher/school-management/:teacherId" element={
          <ProtectedRoute userType="teacher">
            <SchoolManagement />
          </ProtectedRoute>
        } />
        <Route path="/teacher/student-management/:teacherId" element={
          <ProtectedRoute userType="teacher">
            <StudentManagement />
          </ProtectedRoute>
        } />
        <Route path="/student/:studentId" element={
          <ProtectedRoute userType="student">
            <StudentProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/:teacherId" element={
          <ProtectedRoute userType="teacher">
            <TeacherProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/student/rankings" element={
          <ProtectedRoute userType="student">
            <StudentRankings />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
