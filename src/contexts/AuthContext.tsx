
import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import { Session, User } from '@supabase/supabase-js';

// Type for the auth context value
type AuthContextType = {
  isLoggedIn: boolean;
  userType: 'teacher' | 'student' | 'admin' | null;
  userId: string | null;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<boolean>;
  refreshAuthState: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
