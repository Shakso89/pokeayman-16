
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit";
import { toast } from "@/hooks/use-toast";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading: studentAuthLoading, loginStudent } = useStudentAuth();
  const { isLoggedIn, userType, loading: authLoading, refreshAuthState } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Add a timeout to handle potential stuck loading states
  useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 3000); // Show form after 3 seconds even if loading is still true
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [authLoading]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (authLoading || isProcessing) return;

    if (isLoggedIn) {
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");

      if (userType === "teacher") {
        navigate("/teacher-dashboard");
      } else if (userType === "student") {
        navigate(redirect || "/student-dashboard");
      }
    }
  }, [authLoading, isLoggedIn, userType, navigate, isProcessing]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!usernameOrEmail || !password) {
      toast({
        title: "Error",
        description: "Please enter your username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Attempting student login with username:", usernameOrEmail);
      const result = await loginStudent(usernameOrEmail, password);

      if (result.success) {
        console.log("Login successful, refreshing auth state");
        // Refresh the auth state to ensure all components have the latest data
        await refreshAuthState();
        navigate("/student-dashboard");
      } else {
        toast({
          title: "Login Error",
          description: result.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600 p-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500 rounded-full mx-auto" />
          <p className="text-center mt-4">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <PokemonOrbit count={8} />
      </div>

      {/* Logo */}
      <div className="absolute top-10 flex flex-col items-center z-10 mb-8">
        <img
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
          alt="PokéAyman Logo"
          className="h-24 w-auto mb-2"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7))" }}
        />
      </div>

      {/* Login Form */}
      <Card className="w-full max-w-md z-10 mt-20 backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Student Login</CardTitle>
          <CardDescription>Enter your login details to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {authLoading && !showLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="usernameOrEmail" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="usernameOrEmail"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isProcessing || studentAuthLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isProcessing || studentAuthLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isProcessing || studentAuthLoading}
              >
                {isProcessing || studentAuthLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
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

export default StudentLogin;
