
import { HomeIcon, Users, BookOpen, Trophy, MessageSquare, Settings } from "lucide-react";
import Index from "./pages/Index.jsx";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherSignUp from "./pages/TeacherSignUp";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import StudentRankingsPage from "./pages/StudentRankingsPage";
import StudentRankingPage from "./pages/StudentRankingPage";
import TeacherRankingPage from "./pages/TeacherRankingPage";
import Messages from "./pages/Messages";
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
    page: <StudentLogin />,
  },
  {
    title: "Teacher Login",
    to: "/teacher-login", 
    icon: <Users className="h-4 w-4" />,
    page: <TeacherLogin />,
  },
  {
    title: "Teacher Signup",
    to: "/teacher-signup",
    icon: <Users className="h-4 w-4" />,
    page: <TeacherSignUp />,
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
    to: "/student-profile/:studentId",
    icon: <Users className="h-4 w-4" />,
    page: <StudentProfilePage />,
  },
  {
    title: "Teacher Profile",
    to: "/teacher-profile/:teacherId",
    icon: <Users className="h-4 w-4" />,
    page: <TeacherProfilePage />,
  },
  {
    title: "Teacher Profile Self",
    to: "/teacher-profile",
    icon: <Users className="h-4 w-4" />,
    page: <TeacherProfilePage />,
  },
  {
    title: "Student Rankings",
    to: "/student/rankings",
    icon: <Trophy className="h-4 w-4" />,
    page: <StudentRankingsPage />,
  },
  {
    title: "Student Ranking Page",
    to: "/student-ranking",
    icon: <Trophy className="h-4 w-4" />,
    page: <StudentRankingPage />,
  },
  {
    title: "Teacher Ranking Page",
    to: "/teacher-ranking",
    icon: <Trophy className="h-4 w-4" />,
    page: <TeacherRankingPage />,
  },
  {
    title: "Messages",
    to: "/teacher/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Messages />,
  },
  {
    title: "Student Messages",
    to: "/student/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Messages />,
  },
  {
    title: "Admin Dashboard",
    to: "/admin-dashboard",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
];
