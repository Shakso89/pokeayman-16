
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleTeacherLogin } from "./auth/teacherAuthService";

export const useTeacherLogin = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    if (loginInProgress) return; // Prevent multiple login attempts
    
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt via useTeacherLogin hook:", username);

      // All logic is now encapsulated in the single handleTeacherLogin service function
      const result = await handleTeacherLogin(username, password, () => {});
      
      if (result.success) {
        console.log("Login successful, preparing navigation...");
        
        // Small delay to ensure localStorage is set before navigating
        setTimeout(async () => {
          try {
            await refreshAuthState();
            navigate(result.redirect, { replace: true });
          } catch (refreshError) {
            console.warn("Auth refresh warning:", refreshError);
            // Navigate anyway if refresh fails
            navigate(result.redirect, { replace: true });
          }
        }, 200);
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error in useTeacherLogin hook:", err);
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
