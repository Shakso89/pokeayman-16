import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";
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
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (password !== confirmPassword) {
      toast("Passwords do not match", {
        description: "Please make sure your passwords match.",
      });
      setIsLoading(false);
      return;
    }
    
    // Registration logic
    setTimeout(() => {
      // In a real app, you would make an API call to register the user
      const teacherId = "teacher-" + Date.now().toString();
      
      // Store user data in localStorage
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      teachers.push({
        id: teacherId,
        username,
        email,
        password, // In a real app, you would never store plain-text passwords
        avatarUrl,
        students: [],
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("teachers", JSON.stringify(teachers));
      
      toast("Account created", {
        description: "Welcome to TR Ayman! Your account has been created."
      });
      
      navigate("/teacher-login");
      setIsLoading(false);
    }, 1500);
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
