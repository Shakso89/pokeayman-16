
export type AppRole = 'teacher' | 'senior_teacher' | 'supervisor' | 'admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by?: string;
  assigned_at: string;
}

export interface RolePermissions {
  canPostHomework: boolean;
  canApproveHomework: boolean;
  canManageStudents: boolean;
  canCreateClasses: boolean;
  canManageSchools: boolean;
  canManageCredits: boolean;
  canAssignRoles: boolean;
  canFreezeAccounts: boolean;
  hasUnlimitedCredits: boolean;
}

export const getRolePermissions = (role: AppRole): RolePermissions => {
  const basePermissions: RolePermissions = {
    canPostHomework: false,
    canApproveHomework: false,
    canManageStudents: false,
    canCreateClasses: false,
    canManageSchools: false,
    canManageCredits: false,
    canAssignRoles: false,
    canFreezeAccounts: false,
    hasUnlimitedCredits: false,
  };

  switch (role) {
    case 'teacher':
      return {
        ...basePermissions,
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
      };
    case 'senior_teacher':
      return {
        ...basePermissions,
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
        canCreateClasses: true,
      };
    case 'supervisor':
      return {
        ...basePermissions,
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
        canCreateClasses: true,
        canManageSchools: true,
        hasUnlimitedCredits: true,
      };
    case 'admin':
      return {
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
        canCreateClasses: true,
        canManageSchools: true,
        canManageCredits: true,
        canAssignRoles: true,
        canFreezeAccounts: true,
        hasUnlimitedCredits: true,
      };
    default:
      return basePermissions;
  }
};

export const getRoleDisplayName = (role: AppRole): string => {
  switch (role) {
    case 'teacher':
      return 'Teacher';
    case 'senior_teacher':
      return 'Senior Teacher';
    case 'supervisor':
      return 'Supervisor';
    case 'admin':
      return 'Admin';
    default:
      return 'Unknown';
  }
};

export const getRoleBadgeColor = (role: AppRole): string => {
  switch (role) {
    case 'teacher':
      return 'bg-blue-100 text-blue-800';
    case 'senior_teacher':
      return 'bg-green-100 text-green-800';
    case 'supervisor':
      return 'bg-purple-100 text-purple-800';
    case 'admin':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
