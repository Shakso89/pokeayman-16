import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session, User } from '@supabase/supabase-js';

type UserType = 'teacher' | 'student' | 'admin' | null;

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (newSession) handleSession(newSession);
      } else if (event === "SIGNED_OUT") {
        clearAuthState();
      }
    });

    // Initial session check
    const checkSession = async () => {
      setLoading(true);
      try {
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          await handleSession(existingSession);
        } else {
          // Fallback to localStorage (backward compatibility)
          const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
          const localUserType = localStorage.getItem("userType") as UserType;

          if (localIsLoggedIn && localUserType) {
            setIsLoggedIn(true);
            setUserType(localUserType);
            setUserId(
              localUserType === "teacher"
                ? localStorage.getItem("teacherId")
                : localStorage.getItem("studentId")
            );
            setIsAdmin(localStorage.getItem("isAdmin") === "true");
          } else {
            clearAuthState();
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (newSession: Session) => {
    try {
      const currentUser = newSession.user;
      setSession(newSession);
      setUser(currentUser);

      if (currentUser) {
        setIsLoggedIn(true);
        const userData = currentUser.user_metadata || {};

        // Admin check by email and username
        const adminEmails = [
          "ayman.soliman.cc@gmail.com",
          "admin@pokeayman.com",
          "admin@example.com",
        ];
        const isAdminEmail = adminEmails.includes(
          (currentUser.email || "").toLowerCase()
        );
        const isAdminUser =
          isAdminEmail ||
          userData.username === "Admin" ||
          userData.username === "Ayman";

        const userTypeFromMeta = userData.user_type as UserType;

        if (userTypeFromMeta === "student") {
          setupStudentAuth(currentUser.id, userData);
        } else {
          // Check if user is student by looking up DB
          const { data: studentData } = await supabase
            .from("students")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (studentData) {
            setupStudentAuth(currentUser.id, studentData);
          } else {
            setupTeacherAuth(currentUser.id, userData, isAdminUser);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleSession:", error);
      // Fallback in error case
      const sessionUser = newSession.user;
      if (sessionUser) {
        setIsLoggedIn(true);
        setUserType("teacher");
        setUserId(sessionUser.id);
      }
    }
  };

  const setupStudentAuth = (id: string, data: any) => {
    setIsLoggedIn(true);
    setUserType("student");
    setUserId(id);
    setIsAdmin(false);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "student");
    localStorage.setItem("studentId", id);
    localStorage.setItem("studentDisplayName", data.display_name || data.username || "");
    if (data.class_id) localStorage.setItem("studentClassId", data.class_id);
  };

  const setupTeacherAuth = (
    id: string,
    userData: any,
    isAdminUser: boolean
  ) => {
    setIsLoggedIn(true);
    setUserType("teacher");
    setUserId(id);
    setIsAdmin(isAdminUser);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "teacher");
    localStorage.setItem("teacherId", id);
    localStorage.setItem(
      "teacherUsername",
      userData.username || userData.email?.split("@")[0] || ""
    );

    if (isAdminUser) localStorage.setItem("isAdmin", "true");
  };

  const clearAuthState = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUserId(null);
    setSession(null);
    setUser(null);
    setIsAdmin(false);

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherUsername");
    localStorage.removeItem("studentDisplayName");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("studentClassId");
  };

  const logout = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearAuthState();

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoggedIn,
    userType,
    userId,
    session,
    user,
    loading,
    isAdmin,
    logout,
  };
};
