
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherSignUp from "./pages/TeacherSignUp";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import MessagesPage from "./pages/Messages";
import ReportsPage from "./pages/ReportsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import RankingPage from "./pages/RankingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutPage from "./pages/LogoutPage";
import { supabase } from "@/integrations/supabase/client";
import { enableRealtimeForTables } from "@/utils/classSync/classSubscription";

function App() {
  // Check for any Supabase session recovery on load
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !localStorage.getItem("isLoggedIn")) {
        // We have a session but no local storage - probably returning from a redirect
        const userData = session.user.user_metadata || {};
        
        if (userData.user_type === 'teacher' || session.user.email) {
          // This is a teacher
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', 'teacher');
          localStorage.setItem('teacherId', session.user.id);
          localStorage.setItem('teacherUsername', userData.username || session.user.email?.split('@')[0] || '');
        }
      }
    });

    // Enable realtime for all relevant tables
    enableRealtimeForTables();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/student-dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/teacher-signup" element={<TeacherSignUp />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        <Route path="/student/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/reports" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/student/:studentId" element={
          <ProtectedRoute>
            <StudentDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/student/profile/:studentId" element={
          <ProtectedRoute>
            <StudentProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/profile/:teacherId" element={
          <ProtectedRoute>
            <TeacherProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/student/rankings" element={<RankingPage />} />
        <Route path="/teacher/rankings" element={<RankingPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
