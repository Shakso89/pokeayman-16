
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherSignUp from "./pages/TeacherSignUp";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateClassPage from "./pages/CreateClassPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import StudentClassDetailsPage from "./pages/StudentClassDetailsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import RankingPage from "./pages/RankingPage";
import SchoolClassesPage from "./pages/SchoolClassesPage";
import SchoolRankingsPage from "./pages/SchoolRankingsPage";
import Contact from "./pages/Contact";
import Messages from "./pages/Messages";
import ReportsPage from "./pages/ReportsPage";
import LogoutPage from "./pages/LogoutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/teacher-login" element={<TeacherLogin />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/teacher-signup" element={<TeacherSignUp />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/create-class" element={<CreateClassPage />} />
              <Route path="/class-details/:classId" element={<ClassDetailsPage />} />
              <Route path="/student/class/:classId" element={<StudentClassDetailsPage />} />
              <Route path="/student-detail/:studentId" element={<StudentDetailPage />} />
              <Route path="/student-profile/:studentId" element={<StudentProfilePage />} />
              <Route path="/teacher-profile/:teacherId" element={<TeacherProfilePage />} />
              <Route path="/student/rankings" element={<RankingPage />} />
              <Route path="/school/:schoolId/classes" element={<SchoolClassesPage />} />
              <Route path="/school-rankings/:schoolId" element={<SchoolRankingsPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
