
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
  const [accountCreated, setAccountCreated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
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
      
      // Try edge function to create teacher directly with auto-confirmation
      try {
        // Check the correct edge function name and parameters
        const { data: response, error: edgeFunctionError } = await supabase.functions.invoke("handle_student_creation", {
          body: { 
            username, 
            email, 
            password, 
            avatarUrl 
          }
        });
        
        console.log("Edge function response:", response);
        
        if (edgeFunctionError) {
          console.error("Edge function error:", edgeFunctionError);
          throw new Error(edgeFunctionError.message || "Edge function error");
        }
        
        if (response?.error) {
          console.error("Response contains error:", response.error);
          throw new Error(response.error);
        }

        if (response?.success && response?.user) {
          toast({
            title: "Account created successfully",
            description: "You can now login with your credentials.",
          });
          
          setAccountCreated(true);
          
          // Wait 2 seconds before redirecting to login page
          setTimeout(() => {
            navigate("/teacher-login");
          }, 2000);
          
          return;
        } else {
          throw new Error("Failed to create teacher account. Please try again.");
        }
      } catch (edgeFunctionError: any) {
        console.error("Edge function failed:", edgeFunctionError);
        
        // Fall back to regular signup if edge function fails
        console.log("Falling back to direct signup method");
        setErrorMessage(`Edge function error: ${edgeFunctionError.message || "Unknown error"}`);
      }
      
      // Direct signup attempt as fallback
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            avatar_url: avatarUrl,
            user_type: "teacher",
          },
          emailRedirectTo: window.location.origin + "/teacher-login",
        }
      });
      
      if (authError) {
        console.error("Auth error during signup:", authError);
        throw authError;
      }
      
      if (authData.user) {
        console.log("User created successfully:", authData.user.id);
        
        if (authData.user.identities?.length === 0) {
          toast({
            title: "Email already registered",
            description: "This email is already in use. Please try logging in instead.",
            variant: "destructive",
          });
          setErrorMessage("Email already registered");
          setIsLoading(false);
          return;
        }
        
        // Check if email confirmation is required
        if (authData.user.email_confirmed_at === null) {
          setVerificationSent(true);
          
          toast({
            title: "Verification email sent",
            description: "Please check your email to confirm your account.",
          });
        } else {
          // Email already confirmed
          setAccountCreated(true);
          
          toast({
            title: "Account created successfully",
            description: "You can now login with your credentials.",
          });
          
          // Create teacher record in the database
          try {
            const { error: teacherError } = await supabase
              .from('teachers')
              .insert({
                id: authData.user.id,
                username: username,
                email: email,
                display_name: username,
                password: '***',
                is_active: true,
                subscription_type: 'trial'
              });
              
            if (teacherError) {
              console.error("Error creating teacher record:", teacherError);
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
          }
          
          // Wait 2 seconds before redirecting to login page
          setTimeout(() => {
            navigate("/teacher-login");
          }, 2000);
        }
      } else {
        // This case shouldn't happen normally, but added as a fallback
        toast({
          title: "Something went wrong",
          description: "Your account may have been created, but we couldn't confirm it. Please check your email for verification.",
          variant: "destructive",
        });
        
        setErrorMessage("Account creation status unknown. Please check your email.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: "Registration failed",
        description: error.message || "There was an error during registration. Please try again.",
        variant: "destructive",
      });
      
      setErrorMessage(error.message || "Registration error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address to resend verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + "/teacher-login",
        },
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Verification email resent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend verification",
        description: error.message || "An error occurred. Please try again.",
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
          {errorMessage && (
            <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500 text-white">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {accountCreated ? (
            <div className="space-y-6">
              <Alert variant="default" className="bg-green-500/20 border-green-500 text-white">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  Your account has been created successfully! You can now log in with your email and password.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p>You will be redirected to the login page automatically...</p>
                <Button
                  onClick={() => navigate("/teacher-login")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          ) : verificationSent ? (
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
                  onClick={handleResendVerification}
                  className="bg-blue-600 hover:bg-blue-700 mr-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend Verification Email"}
                </Button>
                <Button
                  onClick={() => navigate("/teacher-login")}
                  variant="outline"
                  className="border-blue-600 text-blue-400"
                >
                  Go to Login
                </Button>
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
