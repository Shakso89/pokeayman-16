
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherSignUp from "./pages/TeacherSignUp";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ReportsPage from "./pages/ReportsPage";
import { Messages } from "./pages/Messages"; // This appears to be a named export
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
import CreateClassPage from "./pages/CreateClassPage";

// Create a simple theme provider component since it's missing
const ThemeProvider: React.FC<{
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}> = ({ children }) => {
  return <>{children}</>;
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-signup" element={<TeacherSignUp />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/rankings" element={<RankingPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/teacher-profile/:teacherId" element={<TeacherProfilePage />} />
      <Route path="/student/profile/:studentId" element={<StudentProfilePage />} />
      <Route path="/student-detail/:studentId" element={<StudentDetailPage />} />
      <Route path="/class-details/:classId" element={<ClassDetailsPage />} />
      
      {/* New route for creating classes in any school */}
      <Route path="/create-class/:schoolId" element={<CreateClassPage />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div dir="ltr">
        <ScrollToTop />
        <Router />
        <Toaster />
        <Analytics />
      </div>
    </ThemeProvider>
  );
}

export default App;
