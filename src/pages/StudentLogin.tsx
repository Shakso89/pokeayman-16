import React from "react";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Home } from "lucide-react";
import PokemonDecorations from "@/components/signup/PokemonDecorations";
const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();

  // Find student in classes data when logging in
  const handleLoginSuccess = (username: string, password: string) => {
    const classes = JSON.parse(localStorage.getItem("classes") || "[]");

    // Find student in any class
    for (const cls of classes) {
      const student = cls.students.find((s: any) => s.username === username && s.password === password);
      if (student) {
        localStorage.setItem("studentId", student.id);
        localStorage.setItem("studentName", student.name);
        localStorage.setItem("studentClassId", cls.id);
        break;
      }
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
          <Home className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Logo at the top */}
      <div className="flex justify-center pt-4 mb-4 relative z-10">
        
      </div>
      
      <div className="relative z-10 flex-grow">
        <LoginForm type="student" onLoginSuccess={handleLoginSuccess} darkMode={true} />
      </div>
      
      {/* Pokemon decorations */}
      <PokemonDecorations />
    </div>;
};
export default StudentLogin;