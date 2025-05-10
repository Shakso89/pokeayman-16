
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isTeacherActivated } from "@/utils/activationService";
import ActivationModal from "@/components/modals/ActivationModal";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [showActivationModal, setShowActivationModal] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const isActivated = isTeacherActivated();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // For teachers who are logged in but not activated, show the modal
    // Skip for admin users who are always activated
    if (isLoggedIn && userType === "teacher" && !isActivated && !isAdmin) {
      setShowActivationModal(true);
      toast({
        title: "Account Activation Required",
        description: "Need an activation code? Contact us—there's a whole new teaching experience waiting for you!",
        variant: "destructive",
      });
    }
  }, [isLoggedIn, userType, isActivated, isAdmin, t]);

  const handleCloseModal = () => {
    setShowActivationModal(false);
    // Redirect to contact page if they close the modal without activating
    navigate("/contact");
  };

  // Handle login check
  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }

  // For teachers who are not activated, render a simple placeholder with the activation modal
  // Admin users are exempt from activation check
  if (userType === "teacher" && !isActivated && !isAdmin) {
    return (
      <>
        <ActivationModal isOpen={showActivationModal} onClose={handleCloseModal} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Account Activation Required</h2>
            <p className="mb-6">Need an activation code? Contact us—there's a whole new teaching experience waiting for you!</p>
            <button 
              onClick={() => navigate("/contact")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
