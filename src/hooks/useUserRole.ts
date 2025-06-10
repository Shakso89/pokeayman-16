
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, getRolePermissions, RolePermissions } from '@/types/roles';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<AppRole>('teacher');
  const [permissions, setPermissions] = useState<RolePermissions>(getRolePermissions('teacher'));
  const [isLoading, setIsLoading] = useState(true);
  const [managerSchoolId, setManagerSchoolId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if this is the owner email or username
        const userEmail = user?.email?.toLowerCase();
        const storedEmail = localStorage.getItem("userEmail")?.toLowerCase();
        const username = localStorage.getItem("teacherUsername");
        
        const isOwnerEmail = userEmail === 'ayman.soliman.tr@gmail.com' || 
                            storedEmail === 'ayman.soliman.tr@gmail.com' ||
                            userEmail === 'ayman.soliman.cc@gmail.com' || 
                            storedEmail === 'ayman.soliman.cc@gmail.com';
        const isOwnerUsername = username === 'Ayman' || username === 'Admin';

        if (isOwnerEmail || isOwnerUsername) {
          // Ensure owner role is assigned in database
          try {
            await supabase.rpc('assign_user_role', {
              target_user_id: user.id,
              new_role: 'owner'
            });
          } catch (error) {
            console.log('Note: Could not auto-assign owner role in database, but proceeding with owner permissions');
          }
          
          setUserRole('owner');
          setPermissions(getRolePermissions('owner'));
          setIsLoading(false);
          return;
        }

        // Fetch user role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, manager_school_id')
          .eq('user_id', user.id)
          .order('assigned_at', { ascending: false })
          .limit(1)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching user role:', roleError);
        }

        let role: AppRole = 'teacher';
        let schoolId: string | null = null;

        if (roleData) {
          role = roleData.role as AppRole;
          schoolId = roleData.manager_school_id;
        } else {
          // Fallback to teachers table
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('role')
            .eq('id', user.id)
            .single();

          if (teacherData?.role) {
            role = teacherData.role as AppRole;
          }
        }

        setUserRole(role);
        setPermissions(getRolePermissions(role));
        setManagerSchoolId(schoolId);
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
    managerSchoolId,
    refreshRole: () => {
      if (user?.id) {
        setIsLoading(true);
        // Re-fetch role
        const fetchRole = async () => {
          // Check owner status first
          const userEmail = user?.email?.toLowerCase();
          const storedEmail = localStorage.getItem("userEmail")?.toLowerCase();
          const username = localStorage.getItem("teacherUsername");
          
          const isOwnerEmail = userEmail === 'ayman.soliman.tr@gmail.com' || 
                              storedEmail === 'ayman.soliman.tr@gmail.com' ||
                              userEmail === 'ayman.soliman.cc@gmail.com' || 
                              storedEmail === 'ayman.soliman.cc@gmail.com';
          const isOwnerUsername = username === 'Ayman' || username === 'Admin';

          if (isOwnerEmail || isOwnerUsername) {
            setUserRole('owner');
            setPermissions(getRolePermissions('owner'));
            setIsLoading(false);
            return;
          }

          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role, manager_school_id')
            .eq('user_id', user.id)
            .order('assigned_at', { ascending: false })
            .limit(1)
            .single();

          const role = roleData?.role as AppRole || 'teacher';
          const schoolId = roleData?.manager_school_id || null;
          
          setUserRole(role);
          setPermissions(getRolePermissions(role));
          setManagerSchoolId(schoolId);
          setIsLoading(false);
        };
        fetchRole();
      }
    }
  };
};
