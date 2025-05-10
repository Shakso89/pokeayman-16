
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // For teachers who are logged in but not activated, show the modal
    if (isLoggedIn && userType === "teacher" && !isActivated) {
      setShowActivationModal(true);
      toast({
        title: t("account-not-activated"),
        description: t("need-activation-code-contact-us"),
        variant: "destructive",
      });
    }
  }, [isLoggedIn, userType, isActivated, t]);

  const handleCloseModal = () => {
    setShowActivationModal(false);
    // Redirect to contact page if they close the modal without activating
    navigate("/contact");
  };

  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }

  if (userType === "teacher" && !isActivated) {
    return (
      <>
        <ActivationModal isOpen={showActivationModal} onClose={handleCloseModal} />
        {children} {/* Render children but with modal overlay */}
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
