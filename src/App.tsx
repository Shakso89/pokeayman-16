
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false
    },
  },
});

function App() {
  // Initialize Supabase realtime and check for session on load
  useEffect(() => {
    // Enable realtime functionality for tables (will apply RLS policies)
    enableRealtimeForTables();
    
    // Set up a system channel to ensure the connection is established
    const channel = supabase.channel('system')
      .on('system', { event: 'extension' }, (payload) => {
        console.log('Supabase extension event:', payload);
      })
      .subscribe((status) => {
        console.log('Realtime connection status:', status);
      });
    
    // Set up a presence channel for online users
    const presence = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Get a list of all online users
        const state = presence.presenceState();
        console.log('Online users state:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get the user ID from localStorage
          const userId = localStorage.getItem('teacherId') || localStorage.getItem('studentId');
          if (userId) {
            // Track this user's online presence
            const trackStatus = await presence.track({
              user_id: userId,
              online_at: new Date().toISOString(),
              user_type: localStorage.getItem('userType') || 'unknown'
            });
            console.log('Presence tracking status:', trackStatus);
          }
        }
      });

    // Enable realtime specifically for user activities table
    const enableUserActivitiesRealtime = async () => {
      try {
        const { data, error } = await supabase.rpc('enable_realtime', {
          table_names: ['user_activities']
        });
        
        if (error) {
          console.error("Error enabling realtime for user activities:", error);
        } else {
          console.log("Realtime enabled for user activities");
        }
      } catch (err) {
        console.error("Failed to enable realtime for user activities:", err);
      }
    };
    
    enableUserActivitiesRealtime();
    
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(channel);
      supabase.removeChannel(presence);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
