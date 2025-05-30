
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleTeacherLogin, handleAdminLogin } from "./auth/teacherAuthService";
import { checkDevAdminLogin, isAdminUsername, isAdminEmail, isValidAdminPassword } from "@/utils/adminAuth";

export const useTeacherLogin = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  // Main login handler
  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt:", username);

      // Check if this is an admin login
      const isAdmin =
        (isAdminUsername(username) || isAdminEmail(username)) &&
        isValidAdminPassword(password);

      // Special handling for admin users or dev admin login
      if (isAdmin || checkDevAdminLogin(username, password) || 
          username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
          username.toLowerCase() === "ayman") {
        
        const result = await handleAdminLogin(username, password, () => {});
        await refreshAuthState();
        
        // Delayed navigation to ensure state is updated
        setTimeout(() => {
          navigate(result.redirect, { replace: true });
        }, 300);
      } else {
        const result = await handleTeacherLogin(username, password, () => {});
        await refreshAuthState();
        
        // Delayed navigation to ensure state is updated
        setTimeout(() => {
          navigate(result.redirect, { replace: true });
        }, 300);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoginInProgress(false);
    }
  };

  return {
    error,
    loginInProgress,
    handleLogin
  };
};
