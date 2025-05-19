
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types
interface AuthUser {
  id: string;
  email?: string;
  username?: string;
}

type UserType = 'teacher' | 'student' | null;

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
  userType: UserType;
  loading: boolean;
  refreshAuthState: () => Promise<void>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(false);
  
  // Check if email belongs to an admin
  const isAdminEmail = (email?: string): boolean => {
    if (!email) return false;
    
    const adminEmails = [
      'ayman.soliman.tr@gmail.com',
      'ayman.soliman.cc@gmail.com',
      'admin@pokeayman.com',
      'admin@example.com',
    ];
    
    return adminEmails.includes(email.toLowerCase());
  };
  
  // Check if username indicates admin status
  const isAdminUsername = (username?: string): boolean => {
    if (!username) return false;
    return username === 'Admin' || username === 'Ayman';
  };
  
  // Load auth state from localStorage (for quick UI response)
  const loadFromLocalStorage = () => {
    const localIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!localIsLoggedIn) return false;
    
    const localType = localStorage.getItem('userType') as UserType;
    if (!localType) return false;
    
    const localUsername = localStorage.getItem('teacherUsername') || '';
    const localEmail = localStorage.getItem('userEmail') || '';
    const localIsAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Determine user ID based on type
    const userId = localType === 'teacher'
      ? localStorage.getItem('teacherId')
      : localStorage.getItem('studentId');
    
    if (!userId) return false;
    
    // Create user object
    const userData: AuthUser = {
      id: userId,
      username: localUsername || undefined,
      email: localEmail || undefined
    };
    
    // Set state from localStorage
    setIsLoggedIn(true);
    setUserType(localType);
    setIsAdmin(localIsAdmin || isAdminEmail(localEmail) || isAdminUsername(localUsername));
    setUser(userData);
    
    return true;
  };
  
  // Clear authentication state
  const clearAuthState = () => {
    // Clear state
    setIsLoggedIn(false);
    setUserType(null);
    setIsAdmin(false);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherUsername');
    localStorage.removeItem('studentDisplayName');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('studentClassId');
    localStorage.removeItem('userEmail');
    
    console.info('Auth state cleared');
  };
  
  // Refresh authentication state
  const refreshAuthState = async () => {
    try {
      console.log('Refreshing auth state...');
      setLoading(true);
      
      // Start with localStorage for immediate response
      loadFromLocalStorage();
      
      // Then check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const supabaseUser = session.user;
        const supabaseEmail = supabaseUser.email?.toLowerCase();
        
        // Check for admin status
        const adminStatus = 
          isAdminEmail(supabaseEmail) || 
          isAdminUsername(localStorage.getItem('teacherUsername') || '') ||
          localStorage.getItem('isAdmin') === 'true';
        
        // Set state from Supabase session
        setIsLoggedIn(true);
        setUser({
          id: supabaseUser.id,
          email: supabaseEmail
        });
        
        // Default to teacher if admin, otherwise use localStorage type
        setUserType(localStorage.getItem('userType') as UserType || (adminStatus ? 'teacher' : null));
        setIsAdmin(adminStatus);
        
        // Save email to localStorage if not already there
        if (supabaseEmail && !localStorage.getItem('userEmail')) {
          localStorage.setItem('userEmail', supabaseEmail);
        }
      }
      
      console.info('Auth state refreshed:', {
        isLoggedIn,
        userType,
        isAdmin
      });
    } catch (error) {
      console.error('Error refreshing auth state:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout
  const logout = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local auth state
      clearAuthState();
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error during logout:', error);
      
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Setup auth on initial render
  useEffect(() => {
    // Initial auth check without blocking
    refreshAuthState();
    
    // Setup Supabase auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.info('Auth state changed:', event);
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
