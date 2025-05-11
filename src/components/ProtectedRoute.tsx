
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isTeacherActivated } from "@/utils/activationService";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const isActivated = isTeacherActivated();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();

  // Handle login check
  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }

  // For teachers who are frozen (not activated), render a simple placeholder
  // Admin users are exempt from activation check
  if (userType === "teacher" && !isActivated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center p-4">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Account Frozen</h2>
          <p className="mb-6">Your account is currently frozen. Please contact support for assistance.</p>
          <Button 
            onClick={() => navigate("/contact")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Contact Us
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
