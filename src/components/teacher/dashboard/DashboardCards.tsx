
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, School, BookOpen, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardCardsProps {
  teacherId: string;
  isAdmin: boolean;
  onManageClasses: () => void;
  onAddStudent: () => void;
  onNavigateToClass: (classId: string) => void;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ 
  teacherId, 
  isAdmin, 
  onManageClasses, 
  onAddStudent, 
  onNavigateToClass 
}) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalSchools: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin) {
          // Admin sees all stats
          const [studentsResult, classesResult, schoolsResult] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact' }),
            supabase.from('classes').select('id', { count: 'exact' }),
            supabase.from('schools').select('id', { count: 'exact' })
          ]);

          setStats({
            totalStudents: studentsResult.count || 0,
            totalClasses: classesResult.count || 0,
            totalSchools: schoolsResult.count || 0
          });
        } else {
          // Teacher sees only their stats
          const [createdClasses, assistantClasses] = await Promise.all([
            supabase.from('classes').select('id, students').eq('teacher_id', teacherId),
            supabase.from('classes').select('id, students').contains('assistants', [teacherId])
          ]);

          const allClasses = [
            ...(createdClasses.data || []),
            ...(assistantClasses.data || [])
          ];

          // Remove duplicates
          const uniqueClasses = allClasses.filter((cls, index, self) => 
            index === self.findIndex(c => c.id === cls.id)
          );

          const totalStudents = uniqueClasses.reduce((sum, cls) => 
            sum + (cls.students?.length || 0), 0
          );

          // Get unique schools from the classes
          const schoolIds = new Set();
          for (const cls of uniqueClasses) {
            const { data: classData } = await supabase
              .from('classes')
              .select('school_id')
              .eq('id', cls.id)
              .single();
            
            if (classData?.school_id) {
              schoolIds.add(classData.school_id);
            }
          }

          setStats({
            totalStudents,
            totalClasses: uniqueClasses.length,
            totalSchools: schoolIds.size
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [teacherId, isAdmin]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClasses}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={onManageClasses}
            className="mt-2 w-full"
          >
            Classes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Schools</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSchools}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rankings</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ranking')}
            className="mt-2 w-full"
          >
            View Rankings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCards;
