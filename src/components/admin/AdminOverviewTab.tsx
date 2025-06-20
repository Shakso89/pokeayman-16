
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, BookOpen, Coins, Shield, UserCheck, Crown, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  totalSchools: number;
  totalHomework: number;
  totalCreditsInSystem: number;
  roleBreakdown: {
    teachers: number;
    seniorTeachers: number;
    supervisors: number;
    admins: number;
  };
}

const AdminOverviewTab: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalSchools: 0,
    totalHomework: 0,
    totalCreditsInSystem: 0,
    roleBreakdown: {
      teachers: 0,
      seniorTeachers: 0,
      supervisors: 0,
      admins: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load basic counts with proper error handling
        const [teachersResult, studentsResult, schoolsResult, homeworkResult, creditsResult] = await Promise.allSettled([
          supabase.from('teachers').select('id, role', { count: 'exact' }),
          supabase.from('student_profiles').select('id', { count: 'exact' }), // Use student_profiles instead of students
          supabase.from('schools').select('id', { count: 'exact' }),
          supabase.from('homework').select('id', { count: 'exact' }),
          supabase.from('teacher_credits').select('credits, unlimited_credits')
        ]);

        // Initialize role breakdown
        const roleBreakdown = {
          teachers: 0,
          seniorTeachers: 0,
          supervisors: 0,
          admins: 0
        };

        let totalTeachers = 0;
        let totalStudents = 0;
        let totalSchools = 0;
        let totalHomework = 0;
        let totalCredits = 0;

        // Process teachers data
        if (teachersResult.status === 'fulfilled' && teachersResult.value.data) {
          totalTeachers = teachersResult.value.count || 0;
          
          teachersResult.value.data.forEach(teacher => {
            switch (teacher.role) {
              case 'teacher':
                roleBreakdown.teachers++;
                break;
              case 'senior_teacher':
                roleBreakdown.seniorTeachers++;
                break;
              case 'supervisor':
                roleBreakdown.supervisors++;
                break;
              case 'admin':
                roleBreakdown.admins++;
                break;
              default:
                roleBreakdown.teachers++; // Default to teacher if role is not set
                break;
            }
          });
        }

        // Process students data
        if (studentsResult.status === 'fulfilled') {
          totalStudents = studentsResult.value.count || 0;
        }

        // Process schools data
        if (schoolsResult.status === 'fulfilled') {
          totalSchools = schoolsResult.value.count || 0;
        }

        // Process homework data
        if (homeworkResult.status === 'fulfilled') {
          totalHomework = homeworkResult.value.count || 0;
        }

        // Process credits data
        if (creditsResult.status === 'fulfilled' && creditsResult.value.data) {
          totalCredits = creditsResult.value.data.reduce((sum, credit) => {
            return sum + (credit.unlimited_credits ? 0 : credit.credits || 0);
          }, 0);
        }

        setStats({
          totalTeachers,
          totalStudents,
          totalSchools,
          totalHomework,
          totalCreditsInSystem: totalCredits,
          roleBreakdown
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">System Overview</h3>
      
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Homework</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHomework}</div>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Teachers</p>
                <p className="text-2xl font-bold">{stats.roleBreakdown.teachers}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Senior Teachers</p>
                <p className="text-2xl font-bold">{stats.roleBreakdown.seniorTeachers}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">Supervisors</p>
                <p className="text-2xl font-bold">{stats.roleBreakdown.supervisors}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Crown className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-medium">Admins</p>
                <p className="text-2xl font-bold">{stats.roleBreakdown.admins}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Credits in System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.totalCreditsInSystem.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Total credits available across all teacher accounts
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverviewTab;
