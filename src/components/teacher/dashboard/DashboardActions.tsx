
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, School, Settings, Shield, Coins, Star } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface DashboardActionsProps {
  onAddStudent: () => void;
  onManageClasses: () => void;
  onNavigateToSchools?: () => void;
  onOpenAdminPanel?: () => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  onAddStudent,
  onManageClasses,
  onNavigateToSchools,
  onOpenAdminPanel
}) => {
  const { permissions, userRole } = useUserRole();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Add Student - Available to all teachers */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onAddStudent}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-blue-500" />
            Add Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Create new student accounts and assign them to classes</p>
        </CardContent>
      </Card>

      {/* Manage Classes - Senior Teacher and above */}
      {permissions.canCreateClasses && (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onManageClasses}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-green-500" />
              Manage Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Create and manage class groups, view student progress</p>
          </CardContent>
        </Card>
      )}

      {/* Manage Schools - Supervisor and above */}
      {permissions.canManageSchools && onNavigateToSchools && (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToSchools}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <School className="h-5 w-5 text-purple-500" />
              Manage Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Create and manage school organizations</p>
          </CardContent>
        </Card>
      )}

      {/* Admin Panel - Admin and Owner */}
      {permissions.canAssignRoles && onOpenAdminPanel && (
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200" onClick={onOpenAdminPanel}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {userRole === 'owner' ? (
                <Star className="h-5 w-5 text-yellow-500" />
              ) : (
                <Shield className="h-5 w-5 text-red-500" />
              )}
              {userRole === 'owner' ? 'Owner Panel' : 'Admin Panel'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {userRole === 'owner' 
                ? 'Manage everything including credits, roles, and system administration'
                : 'Manage roles and system administration'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Credits Display */}
      {permissions.hasUnlimitedCredits ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-yellow-500" />
              Credits: Unlimited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You have unlimited credits as a {userRole === 'owner' ? 'Owner' : userRole}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-yellow-500" />
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Manage your credit balance and usage</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardActions;
