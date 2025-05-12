
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "@/hooks/use-toast";
import { Home } from "lucide-react";
import AvatarSelector from "@/components/signup/AvatarSelector";
import SignupFormFields from "@/components/signup/SignupFormFields";
import ContactDialog from "@/components/signup/ContactDialog";
import PokemonDecorations from "@/components/signup/PokemonDecorations";
import { supabase } from "@/integrations/supabase/client";

const TeacherSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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

    try {
      // First, register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            avatar_url: avatarUrl,
            user_type: "teacher",
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (authData.user) {
        // Create teacher record in localStorage for backward compatibility
        const teacherId = authData.user.id;
        
        // Check if activation code is provided (optional now)
        const isActivated = activationCode ? validateActivationCode(activationCode) : false;
        
        // Store user data in localStorage for now (will be replaced with proper DB integration later)
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        teachers.push({
          id: teacherId,
          username,
          email,
          password, // In a real app, you would never store plain-text passwords
          avatarUrl,
          activationCode,
          activated: isActivated, // Default to not activated if no code provided
          activationExpiry: isActivated ? getActivationExpiry(activationCode) : "",
          students: [],
          createdAt: new Date().toISOString()
        });
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // Mark activation code as used if provided
        if (activationCode) {
          const usedCodes = JSON.parse(localStorage.getItem("usedActivationCodes") || "[]");
          usedCodes.push(activationCode);
          localStorage.setItem("usedActivationCodes", JSON.stringify(usedCodes));
        }
        
        toast({
          title: "Account created",
          description: isActivated 
            ? "Welcome to TR Ayman! Your account is fully activated."
            : "Welcome to TR Ayman! Please contact us to activate your account for full access.",
        });
        
        // Sign out the user so they can log in properly
        await supabase.auth.signOut();
        
        navigate("/teacher-login");
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error during registration. Please try again.",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to validate activation code
  const validateActivationCode = (code: string): boolean => {
    // Special case for admin
    if (code === "ADMIN-MASTER-CODE") return true;
    
    // Check if code has been used
    const usedCodes = JSON.parse(localStorage.getItem("usedActivationCodes") || "[]");
    if (usedCodes.includes(code)) {
      toast({
        title: "Code already used",
        description: "This activation code has already been used.",
        variant: "destructive",
      });
      return false;
    }
    
    // Get valid codes from localStorage (in a real app, this would be a server check)
    const validCodes = JSON.parse(localStorage.getItem("activationCodes") || "[]");
    return validCodes.includes(code) || /^(TRIAL|MONTH|YEAR)\d+$/.test(code);
  };
  
  // Function to calculate activation expiry based on code type
  const getActivationExpiry = (code: string): string => {
    const now = new Date();
    
    if (code === "ADMIN-MASTER-CODE") {
      // Never expires for admin
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 100);
      return expiry.toISOString();
    } else if (code.startsWith("TRIAL")) {
      // 7-day trial
      const expiry = new Date(now);
      expiry.setDate(expiry.getDate() + 7);
      return expiry.toISOString();
    } else if (code.startsWith("MONTH")) {
      // Monthly subscription
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 1);
      return expiry.toISOString();
    } else if (code.startsWith("YEAR")) {
      // Annual subscription
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry.toISOString();
    }
    
    return ""; // Invalid code
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
              activationCode={activationCode}
              setActivationCode={setActivationCode}
              isLoading={isLoading}
              onOpenContactDialog={() => setContactDialogOpen(true)}
              onNavigateToLogin={() => navigate("/teacher-login")}
              activationOptional={true} // Make activation code optional
            />
          </form>
          
          <ContactDialog 
            isOpen={contactDialogOpen} 
            onClose={() => setContactDialogOpen(false)}
          />
        </AuthLayout>
      </div>
      
      {/* Pokemon decorations */}
      <PokemonDecorations />
    </div>
  );
};

export default TeacherSignUp;
