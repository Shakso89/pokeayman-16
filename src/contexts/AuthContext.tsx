import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: any;
  userType: 'teacher' | 'student' | null;
  loading: boolean;
  refreshAuthState: () => Promise<void>;
  logout: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(false);
  
  const refreshAuthState = async () => {
    try {
      console.log("Refreshing auth state...");
      setLoading(true);
      
      // Start with localStorage values for immediate response
      const localIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const localType = localStorage.getItem('userType') as 'teacher' | 'student' | null;
      const localUsername = localStorage.getItem('teacherUsername') || '';
      const localEmail = localStorage.getItem('userEmail')?.toLowerCase() || '';
      
      // Set initial state from localStorage for fast UI response
      if (localIsLoggedIn && localType) {
        setIsLoggedIn(true);
        setUserType(localType);
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
      }
      
      // Try to get session from Supabase (async, but won't block UI)
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for admin status from Supabase
      const supabaseUser = session?.user;
      const supabaseEmail = supabaseUser?.email?.toLowerCase();
      
      // Check for Ayman admin status
      const isAymanAdmin =
        localUsername === 'Ayman' ||
        localUsername === 'Admin' ||
        supabaseEmail === 'ayman.soliman.tr@gmail.com' ||
        supabaseEmail === 'ayman.soliman.cc@gmail.com' ||
        localEmail === 'ayman.soliman.tr@gmail.com' ||
        localEmail === 'ayman.soliman.cc@gmail.com';
      
      // Set admin status
      const adminStatus = isAymanAdmin || localStorage.getItem('isAdmin') === 'true';
      
      // If we have Supabase session, use that data
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
        setUserType(localType || (localStorage.getItem('isAdmin') === 'true' ? 'teacher' : null));
        setIsAdmin(adminStatus);
        
        // Save email to localStorage if from Supabase
        if (supabaseEmail && !localStorage.getItem('userEmail')) {
          localStorage.setItem('userEmail', supabaseEmail);
        }
      } 
      // Otherwise rely on localStorage values set above
      
      console.info("Auth state refreshed:", {
        isLoggedIn,
        userType,
        isAdmin: adminStatus
      });
      
    } catch (error) {
      console.error("Error refreshing auth state:", error);
    } finally {
      // Always set loading to false quickly
      setLoading(false);
    }
  };

  // Implement the logout function
  const logout = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Sign out from Supabase if we have a session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear localStorage auth data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('teacherId');
      localStorage.removeItem('studentId');
      localStorage.removeItem('teacherUsername');
      localStorage.removeItem('studentDisplayName');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('studentClassId');
      localStorage.removeItem('userEmail');
      
      // Clear state
      setIsLoggedIn(false);
      setUserType(null);
      setIsAdmin(false);
      setUser(null);
      
      console.info("User logged out successfully");
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Setup auth on initial render
  useEffect(() => {
    // Don't start in loading state
    setLoading(false);
    
    // Initial auth check without blocking
    refreshAuthState();

    // Setup Supabase auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.info("Auth state changed:", _event);
        // Don't set loading to true here - avoid blocking UI
        await refreshAuthState();
      }
    );

    // Unsubscribe on cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    isLoggedIn,
    isAdmin,
    user,
    userType,
    loading,
    refreshAuthState,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
