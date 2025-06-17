
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PokemonOrbit from "@/components/PokemonOrbit";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useStudentAuthNew } from "@/hooks/useStudentAuthNew";

const StudentSignup: React.FC = () => {
  const navigate = useNavigate();
  const { signupStudent, isLoading } = useStudentAuthNew();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    schoolName: "",
    teacherUsername: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    console.log("Starting signup process with data:", { 
      ...formData, 
      password: "***" // Don't log password
    });

    // Validate required fields
    if (!formData.username || !formData.password || !formData.displayName || !formData.schoolName || !formData.teacherUsername) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await signupStudent(formData);
      
      if (result.success && result.student) {
        console.log("Signup successful:", result.student);
        
        toast({
          title: "Success!",
          description: "Your student account has been created successfully!",
        });

        // Set session data
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "student");
        localStorage.setItem("studentId", result.student.id);
        localStorage.setItem("studentName", result.student.display_name || formData.displayName);
        localStorage.setItem("studentDisplayName", result.student.display_name || formData.displayName);

        navigate("/student-dashboard");
      } else {
        console.error("Signup failed:", result.message);
        toast({
          title: "Signup Failed",
          description: result.message || "An error occurred during signup.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <PokemonOrbit count={8} />
      </div>

      <div className="absolute top-10 flex flex-col items-center z-10 mb-8">
        <img
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
          alt="PokéAyman Logo"
          className="h-24 w-auto mb-2"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7))" }}
        />
      </div>

      <Card className="w-full max-w-md z-10 mt-20 backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Student Signup</CardTitle>
          <CardDescription>Create your student account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                placeholder="Enter your display name"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Enter your school name"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacherUsername">Teacher Username *</Label>
              <Input
                id="teacherUsername"
                value={formData.teacherUsername}
                onChange={(e) => handleInputChange("teacherUsername", e.target.value)}
                placeholder="Enter your teacher's username"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button
            variant="link"
            className="px-0 text-blue-600"
            onClick={() => navigate("/student-login")}
          >
            Already have an account? Login
          </Button>
          <Button
            variant="link"
            className="px-0 text-blue-600"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentSignup;
