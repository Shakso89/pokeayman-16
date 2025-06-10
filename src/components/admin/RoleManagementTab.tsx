
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Users, UserCheck, Crown, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppRole, getRoleDisplayName, getRoleBadgeColor, getRoleDescription } from '@/types/roles';

interface Teacher {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  role?: AppRole;
}

interface School {
  id: string;
  name: string;
}

interface RoleManagementTabProps {
  teachers: Teacher[];
  onRefresh: () => void;
}

const RoleManagementTab: React.FC<RoleManagementTabProps> = ({ teachers, onRefresh }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('teacher');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [schools, setSchools] = useState<School[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load schools for manager assignment
  useEffect(() => {
    const loadSchools = async () => {
      const { data } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      setSchools(data || []);
    };
    loadSchools();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedTeacher) return;

    // Validate manager assignment requires school
    if (selectedRole === 'manager' && !selectedSchool) {
      toast({
        title: "Error",
        description: "Managers must be assigned to a school",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: selectedTeacher.id,
        new_role: selectedRole,
        assigned_school_id: selectedRole === 'manager' ? selectedSchool : null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${getRoleDisplayName(selectedRole)} assigned to ${selectedTeacher.display_name}${
          selectedRole === 'manager' ? ` for ${schools.find(s => s.id === selectedSchool)?.name}` : ''
        }`
      });

      setIsDialogOpen(false);
      setSelectedTeacher(null);
      setSelectedRole('teacher');
      setSelectedSchool('');
      onRefresh();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'manager':
        return <Building className="h-4 w-4" />;
      case 'senior_teacher':
        return <UserCheck className="h-4 w-4" />;
      case 'teacher':
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Role Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Teacher</label>
                <Select onValueChange={(value) => {
                  const teacher = teachers.find(t => t.id === value);
                  setSelectedTeacher(teacher || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.display_name} ({teacher.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Select Role</label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                {selectedRole && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getRoleDescription(selectedRole)}
                  </p>
                )}
              </div>

              {selectedRole === 'manager' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Assign to School</label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Managers can only manage classes within their assigned school.
                  </p>
                </div>
              )}
              
              <Button 
                onClick={handleAssignRole} 
                disabled={!selectedTeacher || isAssigning || (selectedRole === 'manager' && !selectedSchool)}
                className="w-full"
              >
                {isAssigning ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(teacher.role || 'teacher')}
                  <div>
                    <h4 className="font-medium">{teacher.display_name}</h4>
                    <p className="text-sm text-gray-500">{teacher.username}</p>
                    {teacher.email && (
                      <p className="text-xs text-gray-400">{teacher.email}</p>
                    )}
                  </div>
                </div>
                <Badge className={getRoleBadgeColor(teacher.role || 'teacher')}>
                  {getRoleDisplayName(teacher.role || 'teacher')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleManagementTab;
