
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import TeacherLogin from '@/pages/TeacherLogin';
import StudentLogin from '@/pages/StudentLogin';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import ClassDetailsPage from '@/pages/ClassDetailsPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
import StudentProfilePage from '@/pages/StudentProfilePage';
import RankingPage from '@/pages/RankingPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LogoutPage from '@/pages/LogoutPage';

function App() {
  const { isLoggedIn, userType, loading } = useAuth();

  // Show loading screen while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  console.log("App: Current auth state", { isLoggedIn, userType, loading });

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/teacher-login" element={
          isLoggedIn && userType === "teacher" ? 
            <Navigate to="/teacher-dashboard" replace /> : 
            <TeacherLogin />
        } />
        <Route path="/student-login" element={
          isLoggedIn && userType === "student" ? 
            <Navigate to="/student-dashboard" replace /> : 
            <StudentLogin />
        } />
        <Route path="/logout" element={<LogoutPage />} />
        
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute requiredUserType="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/class/:classId" element={
          <ProtectedRoute requiredUserType="teacher">
            <ClassDetailsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/student/:studentId" element={
          <ProtectedRoute requiredUserType="teacher">
            <StudentDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/student-dashboard" element={
          <ProtectedRoute requiredUserType="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student-profile" element={
          <ProtectedRoute requiredUserType="student">
            <StudentProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/rankings" element={
          <ProtectedRoute requiredUserType="any">
            <RankingPage />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/rankings" element={
          <ProtectedRoute requiredUserType="teacher">
            <RankingPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
