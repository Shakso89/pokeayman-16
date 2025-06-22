
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import DashboardCards from './DashboardCards';
import RecentClasses from './RecentClasses';
import HomeworkTab from '@/components/homework/HomeworkTab';
import { supabase } from '@/integrations/supabase/client';

interface MainDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddStudent: () => void;
  onManageClasses: () => void;
  onNavigateToClass: (classId: string) => void;
  onCreateClass: () => void;
  teacherId: string;
  isAdmin: boolean;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  activeTab,
  setActiveTab,
  onAddStudent,
  onManageClasses,
  onNavigateToClass,
  onCreateClass,
  teacherId,
  isAdmin
}) => {
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentClasses();
  }, [teacherId, isAdmin]);

  const loadRecentClasses = async () => {
    try {
      setLoading(true);
      let query;

      if (isAdmin) {
        // Admin sees all classes
        query = supabase
          .from('classes')
          .select(`
            id,
            name,
            students,
            school_id,
            teacher_id,
            assistants,
            schools!inner(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
      } else {
        // Teacher sees only classes they created or are assistant in
        const [createdClasses, assistantClasses] = await Promise.all([
          supabase
            .from('classes')
            .select(`
              id,
              name,
              students,
              school_id,
              teacher_id,
              assistants,
              schools!inner(name)
            `)
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('classes')
            .select(`
              id,
              name,
              students,
              school_id,
              teacher_id,
              assistants,
              schools!inner(name)
            `)
            .contains('assistants', [teacherId])
            .order('created_at', { ascending: false })
        ]);

        if (createdClasses.error) throw createdClasses.error;
        if (assistantClasses.error) throw assistantClasses.error;

        const allClasses = [
          ...(createdClasses.data || []),
          ...(assistantClasses.data || [])
        ];

        // Remove duplicates and limit to 5
        const uniqueClasses = allClasses.filter((cls, index, self) => 
          index === self.findIndex(c => c.id === cls.id)
        ).slice(0, 5);

        setRecentClasses(uniqueClasses);
        setLoading(false);
        return;
      }

      const { data, error } = await query;
      if (error) throw error;

      setRecentClasses(data || []);
    } catch (error) {
      console.error('Error loading recent classes:', error);
      setRecentClasses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="homework">Homework</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <DashboardCards
          teacherId={teacherId}
          isAdmin={isAdmin}
          onManageClasses={onManageClasses}
          onAddStudent={onAddStudent}
          onNavigateToClass={onNavigateToClass}
        />
        
        <RecentClasses 
          classes={recentClasses}
          loading={loading}
          onNavigateToClass={onNavigateToClass}
        />
      </TabsContent>

      <TabsContent value="students" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onAddStudent} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add New Student
              </Button>
              <Button variant="outline" onClick={onManageClasses} className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Manage Classes
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Add new students to the system or manage existing classes and their members.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="homework" className="space-y-4">
        <HomeworkTab teacherId={teacherId} />
      </TabsContent>
    </Tabs>
  );
};

export default MainDashboard;
