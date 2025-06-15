
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
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt via useTeacherLogin hook:", username);

      // All logic is now encapsulated in the single handleTeacherLogin service function
      const result = await handleTeacherLogin(username, password, () => {});
      
      if (result.success) {
        // Small delay to ensure state is set before navigating
        setTimeout(async () => {
          await refreshAuthState();
          navigate(result.redirect, { replace: true });
        }, 100);
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
