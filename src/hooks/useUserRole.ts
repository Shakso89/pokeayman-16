
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, getRolePermissions, RolePermissions } from '@/types/roles';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<AppRole>('teacher');
  const [permissions, setPermissions] = useState<RolePermissions>(getRolePermissions('teacher'));
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if this is the admin email or username
        const userEmail = user?.email?.toLowerCase();
        const storedEmail = localStorage.getItem("userEmail")?.toLowerCase();
        const username = localStorage.getItem("teacherUsername");
        
        const isOwnerEmail = userEmail === 'ayman.soliman.tr@gmail.com' || 
                            userEmail === 'ayman.soliman.cc@gmail.com' ||
                            storedEmail === 'ayman.soliman.tr@gmail.com' ||
                            storedEmail === 'ayman.soliman.cc@gmail.com';
        const isOwnerUsername = username === 'Ayman' || username === 'Admin' || username === 'Ayman_1';

        if (isOwnerEmail || isOwnerUsername) {
          console.log("Owner detected via email/username check");
          // Ensure owner role is assigned
          await supabase.rpc('assign_user_role', {
            target_user_id: user.id,
            new_role: 'owner'
          });
          
          setUserRole('owner');
          setPermissions(getRolePermissions('owner'));
          setIsLoading(false);
          return;
        }

        // First check if user has a role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('assigned_at', { ascending: false })
          .limit(1)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching user role:', roleError);
        }

        let role: AppRole = 'teacher';

        if (roleData) {
          role = roleData.role as AppRole;
          console.log("Role from user_roles table:", role);
        } else {
          // Fallback to teachers table
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('role')
            .eq('id', user.id)
            .single();

          if (teacherData?.role) {
            role = teacherData.role as AppRole;
            console.log("Role from teachers table:", role);
          }
        }

        setUserRole(role);
        setPermissions(getRolePermissions(role));
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return {
    userRole,
    permissions,
    isLoading,
    refreshRole: () => {
      if (user?.id) {
        setIsLoading(true);
        // Re-fetch role
        const fetchRole = async () => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .order('assigned_at', { ascending: false })
            .limit(1)
            .single();

          const role = roleData?.role as AppRole || 'teacher';
          setUserRole(role);
          setPermissions(getRolePermissions(role));
          setIsLoading(false);
        };
        fetchRole();
      }
    }
  };
};
