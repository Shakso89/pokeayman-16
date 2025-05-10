
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

  // For teachers who are not activated, we only show the activation modal
  // but don't render children until they're activated
  if (userType === "teacher" && !isActivated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ActivationModal isOpen={showActivationModal} onClose={handleCloseModal} />
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">{t("account-activation-required")}</h2>
          <p>{t("need-activation-code-contact-us")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
