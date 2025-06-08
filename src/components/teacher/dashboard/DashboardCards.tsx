
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, School, UserPlus, BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
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
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalHomework: 0,
    pendingSubmissions: 0
  });

  useEffect(() => {
    if (teacherId) {
      loadStats();
    }
  }, [teacherId]);

  const loadStats = async () => {
    try {
      // Get classes count
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, students')
        .eq('teacher_id', teacherId);

      if (classesError) throw classesError;

      // Get homework count
      const { data: homework, error: homeworkError } = await supabase
        .from('homework')
        .select('id')
        .eq('teacher_id', teacherId);

      if (homeworkError) throw homeworkError;

      // Get pending submissions count
      const homeworkIds = homework?.map(hw => hw.id) || [];
      let pendingCount = 0;
      
      if (homeworkIds.length > 0) {
        const { data: submissions, error: submissionsError } = await supabase
          .from('homework_submissions')
          .select('id')
          .in('homework_id', homeworkIds)
          .eq('status', 'pending');

        if (submissionsError) throw submissionsError;
        pendingCount = submissions?.length || 0;
      }

      // Calculate total students
      const totalStudents = classes?.reduce((total, cls) => {
        return total + (cls.students?.length || 0);
      }, 0) || 0;

      setStats({
        totalClasses: classes?.length || 0,
        totalStudents,
        totalHomework: homework?.length || 0,
        pendingSubmissions: pendingCount
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Stats Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClasses}</div>
        </CardContent>
      </Card>

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
          <CardTitle className="text-sm font-medium">Total Homework</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHomework}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingSubmissions}</div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Class Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage your classes, view students, and organize your teaching materials.
          </p>
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            onClick={onManageClasses}
          >
            <School className="h-4 w-4 mr-2" />
            {t("manage-classes")}
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Student Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create new student accounts and manage your student roster.
          </p>
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white" 
            onClick={onAddStudent}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("create-student")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCards;
