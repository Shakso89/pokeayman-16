
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
  // Initialize Supabase realtime and check for session on load
  useEffect(() => {
    // Check for any Supabase session recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // We have a fresh session from sign-in
        const userData = session.user.user_metadata || {};
        
        // Check for admin accounts
        const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@example.com', 'ayman.soliman.cc@gmial.com'];
        const isAdminEmail = adminEmails.includes(session.user.email?.toLowerCase() || '');
        
        if (userData.user_type === 'teacher' || session.user.email) {
          // This is a teacher
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', 'teacher');
          localStorage.setItem('teacherId', session.user.id);
          localStorage.setItem('teacherUsername', userData.username || session.user.email?.split('@')[0] || '');
          
          if (isAdminEmail || userData.username === "Admin" || userData.username === "Ayman") {
            localStorage.setItem("isAdmin", "true");
          }
        }
      }
    });

    // Enable realtime functionality for tables (will apply RLS policies)
    // This function will try to execute the enable_realtime RPC on the database
    enableRealtimeForTables();
    
    // Set up a realtime channel to ensure the connection is established
    const channel = supabase.channel('system')
      .on('system', { event: 'extension' }, (payload) => {
        console.log('Supabase extension event:', payload);
      })
      .subscribe((status) => {
        console.log('Realtime connection status:', status);
      });
    
    return () => {
      // Clean up subscriptions
      subscription.unsubscribe();
      supabase.removeChannel(channel);
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
