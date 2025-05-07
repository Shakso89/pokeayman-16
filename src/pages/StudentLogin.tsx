
import React from "react";
import { LoginForm } from "@/components/LoginForm";

const StudentLogin: React.FC = () => {
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
  
  return <LoginForm type="student" onLoginSuccess={handleLoginSuccess} />;
};

export default StudentLogin;
