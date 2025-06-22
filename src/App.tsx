
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import RankingPage from "./pages/RankingPage";
import SchoolRankingsPage from "./pages/SchoolRankingsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<"teacher" | "student" | null>(null);

  useEffect(() => {
    // Check authentication status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const type = localStorage.getItem("userType") as "teacher" | "student" | null;
    
    setIsLoggedIn(loggedIn);
    setUserType(type);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/class-details/:classId" element={<ClassDetailsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/school-rankings/:schoolId" element={<SchoolRankingsPage />} />
            <Route path="/teacher/student/:studentId" element={<StudentProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
