
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

  // Simplified login handler with better error handling
  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt:", username);

      // Enhanced admin detection
      const isAdmin =
        (isAdminUsername(username) || isAdminEmail(username)) &&
        isValidAdminPassword(password);

      let result;

      // Special handling for admin users or dev admin login
      if (isAdmin || checkDevAdminLogin(username, password) || 
          username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
          username.toLowerCase() === "ayman.soliman.cc@gmail.com" ||
          username.toLowerCase() === "ayman@pokeayman.com" ||
          username.toLowerCase() === "ayman") {
        
        console.log("Admin login detected for:", username);
        result = await handleAdminLogin(username, password, () => {});
      } else {
        console.log("Regular teacher login for:", username);
        result = await handleTeacherLogin(username, password, () => {});
      }
      
      if (result.success) {
        await refreshAuthState();
        navigate(result.redirect, { replace: true });
      } else {
        throw new Error(result.message || "Login failed");
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
