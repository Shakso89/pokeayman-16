
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassData } from '@/types/pokemon';
import { StudentProfile } from '@/services/studentDatabase';

interface OverviewTabProps {
  classId: string;
  classData: ClassData | null;
  students: StudentProfile[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ classId, classData, students }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((total, student) => total + (student.coins || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono">{classData?.join_code || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {classData?.name || 'Loading...'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {classData?.description || 'No description'}
            </div>
            <div>
              <span className="font-medium">Created:</span> {classData?.created_at ? new Date(classData.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
