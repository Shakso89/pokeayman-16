
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Users, Sword } from "lucide-react";
import ClassManagement from "@/components/teacher/ClassManagement";
import BattleMode from "@/components/teacher/BattleMode";

const TeacherDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<"main" | "classes" | "battle">("main");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" />
      
      <div className="container mx-auto py-8 px-4">
        {currentView === "main" ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Welcome, Teacher!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    Manage Classes/Schools
                  </CardTitle>
                  <CardDescription>
                    Create and manage classes, add students, and organize your schools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Add new students, organize classes, and track student progress in this module.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setCurrentView("classes")}
                  >
                    Manage Classes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="h-6 w-6 text-red-500" />
                    Battle Mode
                  </CardTitle>
                  <CardDescription>
                    Create and manage competition battles between students or classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Set up competitive activities, manage scoring, and track student performance.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => setCurrentView("battle")}
                  >
                    Enter Battle Mode
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        ) : currentView === "classes" ? (
          <ClassManagement onBack={() => setCurrentView("main")} />
        ) : (
          <BattleMode onBack={() => setCurrentView("main")} />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
