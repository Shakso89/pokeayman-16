
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  // Check if user is already logged in
  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType");
    
    if (isLoggedIn && userType === "teacher") {
      navigate("/teacher-dashboard");
    } else if (isLoggedIn && userType === "student") {
      navigate("/student-dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-purple-400 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center mb-8">
        <img 
          src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" 
          alt="TR Ayman Logo" 
          className="h-40 w-auto mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to TR Ayman</h1>
        <p className="text-white text-opacity-90">
          Your interactive learning platform for students and teachers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-6 w-6 text-blue-500" />
              Teacher Login
            </CardTitle>
            <CardDescription>
              Access your teacher dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Manage your classes, students, and create educational battles
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/teacher-login")}
            >
              Teacher Login
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-purple-500" />
              Student Login
            </CardTitle>
            <CardDescription>
              Access your student dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Join battles, view assignments, and track your progress
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/student-login")}
            >
              Student Login
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <p className="text-white text-opacity-80 mt-8 text-sm">
        Don't have an account? Students need to be registered by their teachers.
      </p>
    </div>
  );
};

export default Index;
