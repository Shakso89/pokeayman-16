
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

  // Main login handler with improved username/email sync
  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt:", username);

      // Enhanced admin detection
      const isAdmin =
        (isAdminUsername(username) || isAdminEmail(username)) &&
        isValidAdminPassword(password);

      // Special handling for admin users or dev admin login
      if (isAdmin || checkDevAdminLogin(username, password) || 
          username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
          username.toLowerCase() === "ayman.soliman.cc@gmail.com" ||
          username.toLowerCase() === "ayman@pokeayman.com" ||
          username.toLowerCase() === "ayman") {
        
        console.log("Admin login detected for:", username);
        const result = await handleAdminLogin(username, password, () => {});
        await refreshAuthState();
        
        // Delayed navigation to ensure state is updated
        setTimeout(() => {
          navigate(result.redirect, { replace: true });
        }, 300);
      } else {
        console.log("Regular teacher login for:", username);
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
