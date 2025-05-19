useEffect(() => {
  let isMounted = true;

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Session check error:", error);
        setSessionError("Error checking your login status");
      } else if (session) {
        const email = session.user?.email?.toLowerCase();
        const isAdmin = isAdminEmail(email);
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("teacherUsername", session.user?.user_metadata?.username || "");

        if (isAdmin) {
          localStorage.setItem("isAdmin", "true");
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/teacher-dashboard", { replace: true });
        }

        return;
      }

      // If no session, clear localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("teacherUsername");

      setCheckingSession(false);
    } catch (err) {
      console.error("Error checking session:", err);
      if (isMounted) {
        setCheckingSession(false);
        setSessionError("Failed to check login status");
      }
    }
  };

  const timer = setTimeout(() => {
    checkSession();
  }, 500);

  return () => {
    isMounted = false;
    clearTimeout(timer);
  };
}, [navigate]);
