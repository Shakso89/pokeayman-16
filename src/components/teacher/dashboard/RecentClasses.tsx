
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Loader2 } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  students: any[];
  schools: { name: string };
  teacher_id: string;
  assistants?: string[];
}

interface RecentClassesProps {
  classes: Class[];
  loading: boolean;
  onNavigateToClass: (classId: string) => void;
}

const RecentClasses: React.FC<RecentClassesProps> = ({
  classes,
  loading,
  onNavigateToClass
}) => {
  const handleViewClass = (classId: string) => {
    console.log("RecentClasses - Navigating to class:", classId);
    // Use the class details route that matches the class management behavior
    onNavigateToClass(classId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Classes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recent Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No classes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{classItem.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {classItem.schools?.name || 'Unknown School'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{classItem.students?.length || 0} students</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewClass(classItem.id)}
                >
                  View Class
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentClasses;
