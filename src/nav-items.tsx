
import { HomeIcon, Users, BookOpen, Trophy, MessageSquare, Settings } from "lucide-react";
import Index from "./pages/Index.jsx";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLoginPage from "./pages/StudentLoginPage";
import TeacherLoginPage from "./pages/TeacherLoginPage";
import TeacherSignupPage from "./pages/TeacherSignupPage";
import StudentSignupPage from "./pages/StudentSignupPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentRankingsPage from "./pages/StudentRankingsPage";
import TeacherMessagesPage from "./pages/TeacherMessagesPage";
import StudentMessagesPage from "./pages/StudentMessagesPage";
import AdminDashboard from "./pages/AdminDashboard";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Student Dashboard",
    to: "/student-dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <StudentDashboard />,
  },
  {
    title: "Teacher Dashboard", 
    to: "/teacher-dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <TeacherDashboard />,
  },
  {
    title: "Student Login",
    to: "/student-login",
    icon: <Users className="h-4 w-4" />,
    page: <StudentLoginPage />,
  },
  {
    title: "Teacher Login",
    to: "/teacher-login", 
    icon: <Users className="h-4 w-4" />,
    page: <TeacherLoginPage />,
  },
  {
    title: "Teacher Signup",
    to: "/teacher-signup",
    icon: <Users className="h-4 w-4" />,
    page: <TeacherSignupPage />,
  },
  {
    title: "Student Signup",
    to: "/student-signup",
    icon: <Users className="h-4 w-4" />,
    page: <StudentSignupPage />,
  },
  {
    title: "Class Details",
    to: "/class-details/:id",
    icon: <BookOpen className="h-4 w-4" />,
    page: <ClassDetailsPage />,
  },
  {
    title: "Student Detail",
    to: "/student/:studentId",
    icon: <Users className="h-4 w-4" />,
    page: <StudentDetailPage />,
  },
  {
    title: "Student Profile",
    to: "/student/profile/:studentId",
    icon: <Users className="h-4 w-4" />,
    page: <StudentProfilePage />,
  },
  {
    title: "Student Rankings",
    to: "/student/rankings",
    icon: <Trophy className="h-4 w-4" />,
    page: <StudentRankingsPage />,
  },
  {
    title: "Teacher Messages",
    to: "/teacher/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <TeacherMessagesPage />,
  },
  {
    title: "Student Messages",
    to: "/student/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <StudentMessagesPage />,
  },
  {
    title: "Admin Dashboard",
    to: "/admin-dashboard",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
];
