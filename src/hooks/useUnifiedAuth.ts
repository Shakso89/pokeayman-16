
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { getUserById } from '@/services/userService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Unified authentication hook that works for both students and teachers
export const useUnifiedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      // Check for existing authentication
      const teacherId = localStorage.getItem('teacherId');
      const studentId = localStorage.getItem('studentId');
      
      let userId = teacherId || studentId;
      
      if (userId) {
        const user = await getUserById(userId);
        if (user && !user.isFrozen) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          });
          return;
        }
      }
      
      // No valid authentication found
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  };

  const login = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const user = await getUserById(userId);
      if (!user || user.isFrozen) {
        return false;
      }

      // Store appropriate ID in localStorage
      if (role === 'student') {
        localStorage.setItem('studentId', userId);
        localStorage.removeItem('teacherId');
      } else {
        localStorage.setItem('teacherId', userId);
        localStorage.removeItem('studentId');
      }

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      });

      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('teacherId');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherUsername');
    localStorage.removeItem('studentUsername');
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  const refreshUser = async () => {
    if (authState.user) {
      const updatedUser = await getUserById(authState.user.id);
      if (updatedUser && !updatedUser.isFrozen) {
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));
      } else {
        logout();
      }
    }
  };

  return {
    ...authState,
    login,
    logout,
    refreshUser,
    hasRole: (role: UserRole) => authState.user?.role === role,
    hasMinimumRole: (minRole: UserRole) => {
      if (!authState.user) return false;
      const roles: UserRole[] = ['student', 'teacher', 'senior_teacher', 'manager', 'owner'];
      const userRoleIndex = roles.indexOf(authState.user.role);
      const minRoleIndex = roles.indexOf(minRole);
      return userRoleIndex >= minRoleIndex;
    }
  };
};
