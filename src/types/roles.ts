
export type AppRole = 'teacher' | 'senior_teacher' | 'manager' | 'owner';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by?: string;
  assigned_at: string;
  manager_school_id?: string;
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
  canInviteAssistants: boolean;
  canGiftCredits: boolean;
  canDeletePokemon: boolean;
  isAssistantOnly?: boolean;
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
    canInviteAssistants: false,
    canGiftCredits: false,
    canDeletePokemon: false,
  };

  switch (role) {
    case 'teacher':
      return {
        ...basePermissions,
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
        canDeletePokemon: true,
      };
    case 'senior_teacher':
      return {
        ...basePermissions,
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
        canCreateClasses: true,
        canInviteAssistants: true,
        canDeletePokemon: true,
      };
    case 'manager':
      return {
        ...basePermissions,
        canPostHomework: true,
        canApproveHomework: true,
        canManageStudents: true,
        canCreateClasses: true,
        canManageSchools: true,
        canInviteAssistants: true,
        canGiftCredits: true,
        canDeletePokemon: true,
      };
    case 'owner':
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
        canInviteAssistants: true,
        canGiftCredits: true,
        canDeletePokemon: true,
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
    case 'manager':
      return 'Manager';
    case 'owner':
      return 'Owner';
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
    case 'manager':
      return 'bg-purple-100 text-purple-800';
    case 'owner':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleDescription = (role: AppRole): string => {
  switch (role) {
    case 'teacher':
      return 'Can assist in homework management for invited classes, post homework (5 credits), approve submissions, award/remove coins and Pokémon. Uses own credit balance.';
    case 'senior_teacher':
      return 'All Teacher permissions plus can create, delete, and manage own classes. Can invite assistants to specific classes. Uses own credit balance.';
    case 'manager':
      return 'Must be promoted by Owner. Assigned to one school. Can manage any class in their school and gift credits to other teachers in their school.';
    case 'owner':
      return 'Global control across all schools and classes. Access to Owner Dashboard. Can assign roles and manage credits for any account.';
    default:
      return 'No permissions assigned.';
  }
};

export const CREDIT_COSTS = {
  POST_HOMEWORK: 5,
  DELETE_POKEMON: 3,
  APPROVE_HOMEWORK_BASE: 1, // Multiplied by coin reward
} as const;
