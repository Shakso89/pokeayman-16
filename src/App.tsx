import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import LogoutPage from "./pages/LogoutPage";
import NotFound from "./pages/NotFound";
import RankingPage from "./pages/RankingPage";
import Contact from "./pages/Contact";
import TeacherSignUp from "./pages/TeacherSignUp";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import StudentDetailPage from "./pages/StudentDetailPage";
import ReportsPage from "./pages/ReportsPage";
import Messages from "./pages/Messages";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/teacher-signup" element={<TeacherSignUp />} />
          
          {/* Protected Routes */}
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute requiredUserType="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredUserType="teacher" allowAdminOverride={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student-dashboard" element={
            <ProtectedRoute requiredUserType="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ranking" element={
            <ProtectedRoute requiredUserType="any">
              <RankingPage />
            </ProtectedRoute>
          } />
          <Route path="/student-profile" element={
            <ProtectedRoute requiredUserType="student">
              <StudentProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/teacher-profile" element={
            <ProtectedRoute requiredUserType="teacher">
              <TeacherProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/student/:id" element={
            <ProtectedRoute requiredUserType="teacher">
              <StudentDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requiredUserType="teacher">
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute requiredUserType="any">
              <Messages />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
