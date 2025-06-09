
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, School, GraduationCap, BookOpen, Shield, Coins } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { getRoleDisplayName, getRoleBadgeColor } from "@/types/roles";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DashboardCardsProps {
  teacherId: string;
  onManageClasses: () => void;
  isAdmin: boolean;
  onNavigateToClass?: (classId: string) => void;
  onAddStudent: () => void;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  teacherId,
  onManageClasses,
  isAdmin,
  onNavigateToClass,
  onAddStudent
}) => {
  const { userRole, permissions } = useUserRole();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number>(0);
  const [unlimitedCredits, setUnlimitedCredits] = useState<boolean>(false);

  useEffect(() => {
    const loadCredits = async () => {
      if (!teacherId) return;
      
      try {
        const { data, error } = await supabase
          .from('teacher_credits')
          .select('credits, unlimited_credits')
          .eq('teacher_id', teacherId)
          .single();

        if (data) {
          setCredits(data.credits || 0);
          setUnlimitedCredits(data.unlimited_credits || false);
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      }
    };

    loadCredits();
  }, [teacherId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Role Display Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-500" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={getRoleBadgeColor(userRole)}>
            {getRoleDisplayName(userRole)}
          </Badge>
          <div className="flex items-center gap-2 mt-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            {unlimitedCredits ? (
              <span className="text-sm font-medium text-green-600">Unlimited Credits</span>
            ) : (
              <span className="text-sm font-medium">{credits} Credits</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Student Card */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onAddStudent}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-green-500" />
            Add Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Create new student accounts and assign to classes</p>
          <Button className="mt-3 w-full" variant="outline">
            <GraduationCap className="h-4 w-4 mr-2" />
            Create Student
          </Button>
        </CardContent>
      </Card>

      {/* Manage Classes Card - Senior Teacher and above */}
      {permissions.canCreateClasses && (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onManageClasses}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-500" />
              Manage Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Create and manage class groups</p>
            <Button className="mt-3 w-full" variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              View Classes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manage Schools Card - Supervisor and above */}
      {permissions.canManageSchools && (
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <School className="h-5 w-5 text-orange-500" />
              Manage Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Create and manage school organizations</p>
            <Button className="mt-3 w-full" variant="outline">
              <School className="h-4 w-4 mr-2" />
              View Schools
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Admin Panel Card - Admin only */}
      {permissions.canAssignRoles && (
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-red-200 bg-red-50"
          onClick={() => navigate('/admin-dashboard')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-red-500" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Full system administration</p>
            <Button className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Open Admin
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCards;
