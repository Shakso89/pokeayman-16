
import { useState, useEffect } from 'react';

interface StudentSession {
  isLoggedIn: boolean;
  studentId: string | null;
  studentName: string | null;
  studentUsername: string | null;
  classId: string | null;
  loading: boolean;
}

export const useStudentSession = () => {
  const [session, setSession] = useState<StudentSession>({
    isLoggedIn: false,
    studentId: null,
    studentName: null,
    studentUsername: null,
    classId: null,
    loading: true
  });

  useEffect(() => {
    const checkSession = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userType = localStorage.getItem("userType");
        
        if (isLoggedIn && userType === "student") {
          setSession({
            isLoggedIn: true,
            studentId: localStorage.getItem("studentId"),
            studentName: localStorage.getItem("studentName"),
            studentUsername: localStorage.getItem("studentUsername"),
            classId: localStorage.getItem("studentClassId"),
            loading: false
          });
        } else {
          setSession({
            isLoggedIn: false,
            studentId: null,
            studentName: null,
            studentUsername: null,
            classId: null,
            loading: false
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
        setSession(prev => ({ ...prev, loading: false }));
      }
    };

    checkSession();

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isLoggedIn" || e.key === "userType") {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshSession = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType");
    
    if (isLoggedIn && userType === "student") {
      setSession({
        isLoggedIn: true,
        studentId: localStorage.getItem("studentId"),
        studentName: localStorage.getItem("studentName"),
        studentUsername: localStorage.getItem("studentUsername"),
        classId: localStorage.getItem("studentClassId"),
        loading: false
      });
    } else {
      setSession({
        isLoggedIn: false,
        studentId: null,
        studentName: null,
        studentUsername: null,
        classId: null,
        loading: false
      });
    }
  };

  return {
    ...session,
    refreshSession
  };
};
