
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Award, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import RecentClasses from './RecentClasses';
import DashboardCards from './DashboardCards';
import DashboardActions from './DashboardActions';

interface MainDashboardProps {
  teacherId: string;
  onSwitchView: (view: string) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ teacherId, onSwitchView }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingSubmissions: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [teacherId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch classes with students count
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          created_at,
          schools!inner(name),
          student_profiles!inner(id, user_id, username, display_name)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data"
        });
        return;
      }

      // Transform the data to match expected structure
      const transformedClasses = classesData?.map(classItem => ({
        id: classItem.id,
        name: classItem.name,
        teacher_id: teacherId,
        schools: classItem.schools,
        students: classItem.student_profiles || []
      })) || [];

      setClasses(transformedClasses);

      // Calculate stats
      const totalClasses = transformedClasses.length;
      const totalStudents = transformedClasses.reduce((sum, c) => sum + (c.students?.length || 0), 0);

      setStats({
        totalClasses,
        totalStudents,
        pendingSubmissions: 0 // Will be implemented later
      });

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToClass = (classId: string) => {
    console.log("MainDashboard - Navigating to class:", classId);
    navigate(`/class/${classId}`);
  };

  const handleCreateClass = () => {
    onSwitchView('class-management');
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <DashboardCards stats={stats} loading={loading} />
      
      {/* Action Buttons */}
      <DashboardActions 
        onCreateClass={handleCreateClass}
        onManageStudents={() => onSwitchView('students')}
        onViewHomework={() => onSwitchView('homework')}
        onManageSchools={() => onSwitchView('school-management')}
      />

      {/* Recent Classes */}
      <RecentClasses 
        classes={classes}
        loading={loading}
        onNavigateToClass={handleNavigateToClass}
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Award className="h-5 w-5 text-purple-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => onSwitchView('homework')}
            >
              <BookOpen className="h-6 w-6" />
              <span>Manage Homework</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => onSwitchView('students')}
            >
              <Users className="h-6 w-6" />
              <span>View Students</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/rankings')}
            >
              <Award className="h-6 w-6" />
              <span>View Rankings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainDashboard;
