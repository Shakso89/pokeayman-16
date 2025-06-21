
import React from "react";
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
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">No schools found</p>
        <p className="text-sm text-gray-400 mt-1">Schools will appear here once they are created</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Responsive grid that adapts to screen size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {schools.map((school) => (
          <div key={school.id} className="h-full">
            <SchoolCard
              school={school}
              onViewSchoolPool={onViewSchoolPool}
              onRefresh={onRefresh}
              onSelectSchool={onSelectSchool}
              onManageClasses={onManageClasses}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolsGrid;
