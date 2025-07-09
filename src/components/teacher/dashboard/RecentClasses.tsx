import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Loader2 } from 'lucide-react';

// Define a more specific type for a student.
// Here, we only need to count them, so an array of objects with at least an 'id' is sufficient.
// If you planned to display more student details in this component, you'd expand this interface.
interface StudentSummary {
  id: string;
  // Add other properties if you need them, e.g., name: string;
}

interface Class {
  id: string;
  name: string;
  // Assuming 'students' is an array of student objects (even if just their IDs)
  students: StudentSummary[];
  // 'schools' could potentially be null if the join fails or no school is linked.
  // Using null allows for safe optional chaining.
  schools: { name: string } | null;
  teacher_id: string;
  assistants?: string[]; // Optional array of assistant IDs (strings)
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
    console.log("RecentClasses - Navigating to class details:", classId);
    onNavigateToClass(classId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Recent Classes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Recent Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No classes found.</p>
            <p className="text-sm mt-2 text-gray-400">Classes will appear here once created or assigned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{classItem.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs text-gray-600 bg-gray-100 border-gray-200">
                      {classItem.schools?.name || 'Unknown School'} {/* Safely access school name */}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-3 w-3 text-blue-400" />
                      <span>{classItem.students?.length ?? 0} students</span> {/* Safely get student count */}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewClass(classItem.id)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
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