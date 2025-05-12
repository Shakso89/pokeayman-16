
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import AdminHeader from "@/components/admin/AdminHeader";
import TeachersTab from "@/components/admin/TeachersTab";
import StudentsTab from "@/components/admin/StudentsTab";
import CreditManagement from "@/components/admin/CreditManagement";

// Types for our user data
interface TeacherData {
  id: string;
  username: string;
  displayName: string;
  schools?: string[];
  students?: string[];
  createdAt: string;
  lastLogin?: string;
  timeSpent?: number; // in minutes
  expiryDate?: string;
  subscriptionType?: "trial" | "monthly" | "annual";
  isActive: boolean;
  // Add the properties that were calculated in the useEffect
  numSchools?: number;
  numStudents?: number;
}

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  lastLogin?: string;
  timeSpent?: number; // in minutes
  coinsSpent?: number;
  isActive: boolean;
}

const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [activeTab, setActiveTab] = useState("teachers");
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Check if current user is Admin - UPDATED to check for username "Admin"
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin";

  useEffect(() => {
    // Load teachers data
    const storedTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");

    // Process teacher data to include additional admin metrics
    const processedTeachers = storedTeachers.map((teacher: any) => {
      // Calculate number of schools
      const numSchools = teacher.schools ? teacher.schools.length : 0;

      // Calculate number of students
      const numStudents = teacher.students ? teacher.students.length : 0;
      return {
        ...teacher,
        numSchools,
        numStudents,
        // Default values for metrics that might not exist yet
        timeSpent: teacher.timeSpent || 0,
        lastLogin: teacher.lastLogin || "Never",
        expiryDate: teacher.expiryDate || "No expiry",
        subscriptionType: teacher.subscriptionType || "trial",
        isActive: teacher.isActive !== false // Default to true if not specified
      };
    });
    setTeachers(processedTeachers);

    // Load students data
    const storedStudents = JSON.parse(localStorage.getItem("students") || "[]");

    // Get student Pokémon to calculate coins spent
    const studentPokemon = JSON.parse(localStorage.getItem("studentPokemons") || "[]");

    // Process student data
    const processedStudents = storedStudents.map((student: any) => {
      // Find student's coin data
      const pokemonData = studentPokemon.find((sp: any) => sp.studentId === student.id);
      const coinsSpent = pokemonData ? pokemonData.coins || 0 : 0;
      return {
        ...student,
        coinsSpent,
        timeSpent: student.timeSpent || 0,
        lastLogin: student.lastLogin || "Never",
        isActive: student.isActive !== false // Default to true if not specified
      };
    });
    setStudents(processedStudents);
  }, []);

  // Redirect if not admin with username "Admin"
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName="Admin" />
      
      <div className="container mx-auto py-8 px-4">
        <AdminHeader t={t} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="teachers">{t("teachers") || "Teachers"}</TabsTrigger>
            <TabsTrigger value="students">{t("students") || "Students"}</TabsTrigger>
            <TabsTrigger value="credits">{t("credits") || "Credits"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers" className="mt-0">
            <TeachersTab teachers={teachers} setTeachers={setTeachers} t={t} />
          </TabsContent>
          
          <TabsContent value="students" className="mt-0">
            <StudentsTab students={students} setStudents={setStudents} t={t} />
          </TabsContent>
          
          <TabsContent value="credits" className="mt-0">
            <CreditManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
