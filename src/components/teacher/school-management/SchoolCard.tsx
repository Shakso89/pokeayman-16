
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Users, BookOpen, Eye, RefreshCw } from "lucide-react";

interface SchoolWithCounts {
  id: string;
  name: string;
  student_count: number;
  class_count: number;
}

interface SchoolCardProps {
  school: SchoolWithCounts;
  onViewSchoolPool: (schoolId: string) => void;
  onRefresh: () => void;
  onSelectSchool: (schoolId: string) => void;
  onManageClasses: (schoolId: string) => void;
}

const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  onViewSchoolPool,
  onRefresh,
  onSelectSchool,
  onManageClasses
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5" />
          {school.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-sm text-gray-600">Students</p>
            <p className="font-bold text-blue-600">{school.student_count}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <BookOpen className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-sm text-gray-600">Classes</p>
            <p className="font-bold text-green-600">{school.class_count}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewSchoolPool(school.id)}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Pool
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => onSelectSchool(school.id)}
            className="w-full"
            size="sm"
          >
            Create Class in {school.name}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onManageClasses(school.id)}
            className="w-full"
            size="sm"
          >
            Manage Classes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCard;
