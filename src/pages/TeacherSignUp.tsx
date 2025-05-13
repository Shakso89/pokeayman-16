
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "@/hooks/use-toast";
import { Home } from "lucide-react";
import AvatarSelector from "@/components/signup/AvatarSelector";
import SignupFormFields from "@/components/signup/SignupFormFields";
import PokemonDecorations from "@/components/signup/PokemonDecorations";
import { supabase } from "@/integrations/supabase/client";

const TeacherSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation
      if (password !== confirmPassword) {
        toast({
          title: "Passwords do not match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        });
        return;
      }

      if (!username || username.trim() === "") {
        toast({
          title: "Username required",
          description: "Please enter a username.",
          variant: "destructive",
        });
        return;
      }

      // Check if the email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      console.log("Starting sign up process for:", email);
      
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            avatar_url: avatarUrl,
            user_type: "teacher",
          },
        }
      });
      
      if (authError) {
        console.error("Auth error during signup:", authError);
        
        // Handle specific error cases
        if (authError.message?.includes("User already registered")) {
          toast({
            title: "Email already registered",
            description: "This email is already in use. Please try logging in instead.",
            variant: "destructive",
          });
        } else if (authError.message?.includes("Password should be")) {
          toast({
            title: "Password requirements",
            description: authError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: authError.message || "An error occurred during signup.",
            variant: "destructive",
          });
        }
        return;
      }
      
      if (authData.user) {
        console.log("User created successfully:", authData.user.id);
        
        toast({
          title: "Account created",
          description: "Welcome to PokéAyman! Your account has been created.",
        });
        
        // Wait a moment before redirecting to ensure toast is seen
        setTimeout(() => {
          navigate("/teacher-login");
        }, 1500);
      } else {
        // This case shouldn't happen normally, but added as a fallback
        toast({
          title: "Something went wrong",
          description: "Your account may have been created, but we couldn't confirm it. Please try logging in.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/teacher-login");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: "Registration failed",
        description: error.message || "There was an error during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 relative overflow-hidden">
      {/* Header area with home button */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/")}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        <AuthLayout
          title="Teacher Sign Up"
          description="Create your account to manage your classes"
          className="bg-black/70 text-white border-gray-800"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AvatarSelector 
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
            />
            
            <SignupFormFields
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              isLoading={isLoading}
              onNavigateToLogin={() => navigate("/teacher-login")}
            />
          </form>
        </AuthLayout>
      </div>
      
      {/* Pokemon decorations */}
      <PokemonDecorations />
    </div>
  );
};

export default TeacherSignUp;
