
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { School } from "lucide-react";
import SchoolCard from "./SchoolCard";

interface SchoolWithCounts {
  id: string;
  name: string;
  student_count: number;
  class_count: number;
}

interface SchoolsGridProps {
  schools: SchoolWithCounts[];
  onViewSchoolPool: (schoolId: string) => void;
  onRefresh: () => void;
  onSelectSchool: (schoolId: string) => void;
  onManageClasses: (schoolId: string) => void;
}

const SchoolsGrid: React.FC<SchoolsGridProps> = ({
  schools,
  onViewSchoolPool,
  onRefresh,
  onSelectSchool,
  onManageClasses
}) => {
  if (schools.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No schools found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
        <SchoolCard
          key={school.id}
          school={school}
          onViewSchoolPool={onViewSchoolPool}
          onRefresh={onRefresh}
          onSelectSchool={onSelectSchool}
          onManageClasses={onManageClasses}
        />
      ))}
    </div>
  );
};

export default SchoolsGrid;
