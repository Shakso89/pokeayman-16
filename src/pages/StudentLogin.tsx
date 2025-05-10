
import React from "react";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Home } from "lucide-react";

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Find student in classes data when logging in
  const handleLoginSuccess = (username: string, password: string) => {
    const classes = JSON.parse(localStorage.getItem("classes") || "[]");
    
    // Find student in any class
    for (const cls of classes) {
      const student = cls.students.find(
        (s: any) => s.username === username && s.password === password
      );
      
      if (student) {
        localStorage.setItem("studentId", student.id);
        localStorage.setItem("studentName", student.name);
        localStorage.setItem("studentClassId", cls.id);
        break;
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-cover bg-center relative overflow-hidden" 
         style={{ 
           backgroundImage: "linear-gradient(90deg, hsla(139, 70%, 75%, 1) 0%, hsla(63, 90%, 76%, 1) 100%)"
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
      
      <div className="flex-grow">
        <LoginForm type="student" onLoginSuccess={handleLoginSuccess} />
      
        {/* Teacher login redirection box */}
        <div className="flex justify-center mt-4 pb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md max-w-md w-full">
            <p className="text-center mb-4 text-gray-700 font-medium">{t("are-you-a-teacher")}</p>
            <Button
              variant="default"
              onClick={() => navigate("/teacher-login")}
              className="w-full"
            >
              {t("teacher-login")}
            </Button>
          </div>
        </div>
      </div>

      {/* Pokémon decoration at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around pointer-events-none">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" 
          alt="Bulbasaur" 
          className="h-24 w-auto animate-bounce" 
          style={{ animationDuration: "2.3s", animationDelay: "0.1s" }}
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png" 
          alt="Chikorita" 
          className="h-24 w-auto animate-bounce" 
          style={{ animationDuration: "2.1s", animationDelay: "0.4s" }}
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png" 
          alt="Eevee" 
          className="h-24 w-auto animate-bounce" 
          style={{ animationDuration: "2.4s", animationDelay: "0.6s" }}
        />
      </div>
    </div>
  );
};

export default StudentLogin;
