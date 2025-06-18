
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherSignUp from "./pages/TeacherSignUp";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ReportsPage from "./pages/ReportsPage";
import Messages from "./pages/Messages";
import RankingPage from "./pages/RankingPage";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import LogoutPage from "./pages/LogoutPage";
import NotFound from "./pages/NotFound";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentDetailPage from "./pages/StudentDetailPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import { useTranslation } from "./hooks/useTranslation";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from "@/components/theme-provider";
import CreateClassPage from "./pages/CreateClassPage";
import StudentClassDetailsPage from "./pages/StudentClassDetailsPage";
import SchoolClassesPage from "./pages/SchoolClassesPage";

function ScrollToTop() {
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Router() {
  return <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-signup" element={<TeacherSignUp />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/teacher/messages" element={<Messages userType="teacher" />} />
      <Route path="/student/messages" element={<Messages userType="student" />} />
      <Route path="/rankings" element={<RankingPage />} />
      <Route path="/student/rankings" element={<RankingPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/teacher-profile/:teacherId" element={<TeacherProfilePage />} />
      <Route path="/student/profile/:studentId" element={<StudentProfilePage />} />
      {/* NEW: Ensure /student-profile/:studentId shows the profile page */}
      <Route path="/student-profile/:studentId" element={<StudentDetailPage />} />
      <Route path="/student-detail/:studentId" element={<StudentDetailPage />} />
      <Route path="/class-details/:classId" element={<ClassDetailsPage />} />
      <Route path="/student/class/:classId" element={<StudentClassDetailsPage />} />
      {/* New route for creating classes in any school */}
      <Route path="/create-class/:schoolId" element={<CreateClassPage />} />
      {/* Add missing teacher routes for student profiles */}
      <Route path="/teacher/student/:studentId" element={<StudentDetailPage />} />
      <Route path="/teacher/profile/:teacherId" element={<TeacherProfilePage />} />
      <Route path="/school/:schoolId/classes" element={<SchoolClassesPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>;
}
function App() {
  const {
    t
  } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div dir="ltr" className="min-h-screen bg-transparent flex flex-col items-center\n">
        <ScrollToTop />
        <Router />
        <Toaster />
        <Analytics />
      </div>
    </ThemeProvider>;
}
export default App;
