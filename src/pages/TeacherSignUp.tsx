
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const TeacherSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  
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
        setIsLoading(false);
        return;
      }

      if (!username || username.trim() === "") {
        toast({
          title: "Username required",
          description: "Please enter a username.",
          variant: "destructive",
        });
        setIsLoading(false);
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
        setIsLoading(false);
        return;
      }

      console.log("Starting sign up process for:", email);
      
      // Try regular signup first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            avatar_url: avatarUrl,
            user_type: "teacher",
          },
          // This ensures the user gets a confirmation email
          emailRedirectTo: window.location.origin + "/teacher-login",
        }
      });
      
      if (authError) {
        console.error("Auth error during signup:", authError);
        
        // Check if it's a rate limit error
        if (authError.message?.includes("rate limit") || authError.message?.includes("exceeded")) {
          console.log("Rate limit exceeded, trying alternative signup method");
          setRateLimitExceeded(true);
          
          // Call our edge function to bypass the rate limit
          const response = await supabase.functions.invoke("handle_student_creation", {
            body: { username, email, password, avatarUrl }
          });
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          toast({
            title: "Account created successfully",
            description: "You can now login with your credentials.",
          });
          
          // Redirect to login page as the account is already confirmed
          setTimeout(() => {
            navigate("/teacher-login");
          }, 2000);
          
          return;
        }
        
        // Handle other error cases
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
        setIsLoading(false);
        return;
      }
      
      if (authData.user) {
        console.log("User created successfully:", authData.user.id);
        setVerificationSent(true);
        
        toast({
          title: "Verification email sent",
          description: "Please check your email to confirm your account.",
        });
        
        // Don't redirect automatically - wait for email confirmation
      } else {
        // This case shouldn't happen normally, but added as a fallback
        toast({
          title: "Something went wrong",
          description: "Your account may have been created, but we couldn't confirm it. Please check your email for verification.",
          variant: "destructive",
        });
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
          {verificationSent ? (
            <div className="space-y-6">
              <Alert variant="default" className="bg-blue-500/20 border-blue-500 text-white">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  We've sent a verification email to <strong>{email}</strong>. 
                  Please check your inbox and click the link to verify your account before logging in.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p>Didn't receive the email? Check your spam folder or request a new one.</p>
                <Button
                  onClick={() => navigate("/teacher-login")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          ) : rateLimitExceeded ? (
            <div className="space-y-6">
              <Alert variant="default" className="bg-yellow-500/20 border-yellow-500 text-white">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  Our email service is currently experiencing high traffic. We're using an alternative method to create your account.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p>Your account is being created. Please wait...</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </AuthLayout>
      </div>
      
      {/* Pokemon decorations */}
      <PokemonDecorations />
    </div>
  );
};

export default TeacherSignUp;
