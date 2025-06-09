
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Coins, UserCog, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AdminOverviewTab from './AdminOverviewTab';
import RoleManagementTab from './RoleManagementTab';
import CreditManagementTab from './CreditManagementTab';
import AccountManagementTab from './AccountManagementTab';
import TeachersTab from './TeachersTab';
import StudentsTab from './StudentsTab';

interface Teacher {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  is_active: boolean;
  role?: string;
  last_login?: string;
  credits?: number;
  unlimited_credits?: boolean;
}

interface Student {
  id: string;
  username: string;
  display_name: string;
  teacher_id: string;
  created_at: string;
  last_login?: string;
  time_spent?: number;
  is_active: boolean;
}

interface EnhancedAdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({ activeTab, setActiveTab }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load teachers with credit information
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          *,
          teacher_credits (
            credits,
            unlimited_credits
          )
        `);

      if (teachersError) throw teachersError;

      const processedTeachers = (teachersData || []).map(teacher => ({
        ...teacher,
        credits: teacher.teacher_credits?.[0]?.credits || 0,
        unlimited_credits: teacher.teacher_credits?.[0]?.unlimited_credits || false
      }));

      setTeachers(processedTeachers);

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="credits">
            <Coins className="h-4 w-4 mr-2" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <UserCog className="h-4 w-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <Users className="h-4 w-4 mr-2" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverviewTab />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagementTab teachers={teachers} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="credits">
          <CreditManagementTab teachers={teachers} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountManagementTab teachers={teachers} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="teachers">
          <TeachersTab teachers={teachers} setTeachers={setTeachers} t={(key: string) => key} />
        </TabsContent>

        <TabsContent value="students">
          <StudentsTab students={students} setStudents={setStudents} t={(key: string) => key} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminDashboard;
