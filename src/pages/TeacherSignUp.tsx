
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
        
        // Store user data in localStorage for now (will be replaced with proper DB integration later)
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        teachers.push({
          id: teacherId,
          username,
          email,
          password, // In a real app, you would never store plain-text passwords
          avatarUrl,
          students: [],
          isActive: true, // All accounts are active by default now
          createdAt: new Date().toISOString()
        });
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // Initialize teacher credits
        const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
        teacherCredits.push({
          teacherId,
          username,
          displayName: username,
          credits: 100, // Start with 100 free credits (updated from 500)
          usedCredits: 0,
          transactionHistory: [
            {
              id: `tr-${Date.now()}`,
              teacherId,
              amount: 100,
              reason: "Initial free credits",
              timestamp: new Date().toISOString()
            }
          ]
        });
        localStorage.setItem("teacherCredits", JSON.stringify(teacherCredits));
        
        toast({
          title: "Account created",
          description: "Welcome to TR Ayman! Your account is fully activated with 100 free credits.",
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
              onOpenContactDialog={() => setContactDialogOpen(true)}
              onNavigateToLogin={() => navigate("/teacher-login")}
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
