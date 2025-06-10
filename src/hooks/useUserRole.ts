
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, getRolePermissions, RolePermissions } from '@/types/roles';
import { useAuth } from '@/contexts/AuthContext';

const OWNER_EMAILS = ['ayman.soliman.tr@gmail.com', 'ayman.soliman.cc@gmail.com'];
const OWNER_USERNAMES = ['Ayman', 'Admin', 'Ayman_1'];

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<AppRole>('teacher');
  const [permissions, setPermissions] = useState<RolePermissions>(getRolePermissions('teacher'));
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const isOwnerAccount = () => {
    const userEmail = user?.email?.toLowerCase();
    const storedEmail = localStorage.getItem("userEmail")?.toLowerCase();
    const username = localStorage.getItem("teacherUsername");
    
    console.log("Owner check details:", {
      userEmail,
      storedEmail,
      username,
      OWNER_EMAILS,
      OWNER_USERNAMES
    });
    
    const isOwnerEmail = (userEmail && OWNER_EMAILS.includes(userEmail)) ||
                        (storedEmail && OWNER_EMAILS.includes(storedEmail));
    const isOwnerUsername = username && OWNER_USERNAMES.includes(username);
    
    const result = isOwnerEmail || isOwnerUsername;
    console.log("Owner account check result:", result);
    
    return result;
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if this is the owner account first
        if (isOwnerAccount()) {
          console.log("Owner account detected, assigning owner role");
          
          // Ensure owner role is assigned in database
          try {
            await supabase.rpc('assign_user_role', {
              target_user_id: user.id,
              new_role: 'owner'
            });
          } catch (error) {
            console.error("Error assigning owner role:", error);
          }
          
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
    isOwner: isOwnerAccount(),
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
