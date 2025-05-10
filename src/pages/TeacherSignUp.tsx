
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Validate activation code
    if (!validateActivationCode(activationCode)) {
      toast({
        title: "Invalid activation code",
        description: "Please enter a valid activation code or contact us to get one.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Registration logic
    setTimeout(() => {
      // In a real app, you would make an API call to register the user
      
      const teacherId = "teacher-" + Date.now().toString();
      
      // Store user data in localStorage (this is a simple demo, in a real app, you would use a server)
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      teachers.push({
        id: teacherId,
        username,
        email,
        password, // In a real app, you would never store plain-text passwords
        avatarUrl,
        activationCode,
        activationExpiry: getActivationExpiry(activationCode),
        students: [],
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("teachers", JSON.stringify(teachers));
      
      // Mark activation code as used
      const usedCodes = JSON.parse(localStorage.getItem("usedActivationCodes") || "[]");
      usedCodes.push(activationCode);
      localStorage.setItem("usedActivationCodes", JSON.stringify(usedCodes));
      
      toast({
        title: "Account created",
        description: "Welcome to TR Ayman! You can now login.",
      });
      
      navigate("/teacher-login");
      setIsLoading(false);
    }, 1500);
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
    <div className="min-h-screen bg-cover bg-center relative overflow-hidden" 
         style={{ 
           backgroundImage: "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)"
         }}>
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/")}
          className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
      
      <AuthLayout
        title="Teacher Sign Up"
        description="Create your account to manage your classes"
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
          />
        </form>
        
        <ContactDialog 
          isOpen={contactDialogOpen} 
          onClose={() => setContactDialogOpen(false)}
        />
      </AuthLayout>
      
      <PokemonDecorations />
    </div>
  );
};

export default TeacherSignUp;
