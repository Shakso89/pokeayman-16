
import React from "react";
import { LoginForm } from "@/components/LoginForm";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import PokemonDecorations from "@/components/signup/PokemonDecorations";

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = (username: string, password: string) => {
    // Check if this is the admin login
    const isAdmin = username === "Admin" && password === "AdminAyman";
    
    // Store admin status if it's the admin
    if (isAdmin) {
      localStorage.setItem("isAdmin", "true");
      // Redirect to admin dashboard
      navigate("/admin-dashboard");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 relative overflow-hidden">
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
      
      {/* Logo at the top */}
      <div className="flex justify-center pt-4 mb-4 relative z-10">
        <img 
          src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" 
          alt="PokéAyman Logo" 
          className="h-24 w-auto cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        />
      </div>
      
      <div className="relative z-10">
        <LoginForm type="teacher" onLoginSuccess={handleLoginSuccess} darkMode={true} />
      </div>
      
      {/* Pokemon decorations */}
      <PokemonDecorations />
    </div>
  );
};

export default TeacherLogin;
