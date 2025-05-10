
import React from "react";
import { LoginForm } from "@/components/LoginForm";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-cover bg-center relative overflow-hidden" 
         style={{ 
           backgroundImage: "linear-gradient(to right, #accbee 0%, #e7f0fd 100%)"
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
      
      {/* Logo at the top */}
      <div className="flex justify-center pt-4 mb-4">
        <img 
          src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" 
          alt="PokéAyman Logo" 
          className="h-24 w-auto cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        />
      </div>
      
      <LoginForm type="teacher" onLoginSuccess={handleLoginSuccess} />
      
      {/* Pokémon decoration at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around pointer-events-none">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" 
          alt="Pikachu" 
          className="h-24 w-auto animate-bounce" 
          style={{ animationDuration: "2s", animationDelay: "0.2s" }}
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" 
          alt="Charmander" 
          className="h-24 w-auto animate-bounce" 
          style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" 
          alt="Squirtle" 
          className="h-24 w-auto animate-bounce" 
          style={{ animationDuration: "2.2s", animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
};

export default TeacherLogin;
