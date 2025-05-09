
import React from "react";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

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
    <div className="flex flex-col min-h-screen">
      <LoginForm type="student" onLoginSuccess={handleLoginSuccess} />
      
      {/* Teacher login redirection button */}
      <div className="flex justify-center mt-4 pb-8">
        <Button
          variant="outline"
          onClick={() => navigate("/teacher-login")}
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          {t("are-you-a-teacher")} - {t("teacher-login")}
        </Button>
      </div>
    </div>
  );
};

export default StudentLogin;
