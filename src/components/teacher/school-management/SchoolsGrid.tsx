
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School, Users, BookOpen, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface School {
  id: string;
  name: string;
  student_count: number;
  class_count: number;
}

interface SchoolsGridProps {
  schools: School[];
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
  const { t } = useTranslation();

  const handleManageClasses = (schoolId: string) => {
    console.log("Managing classes for school:", schoolId);
    onSelectSchool(schoolId);
  };

  if (schools.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t("no-schools-found")}</p>
          <Button onClick={onRefresh} className="mt-4">
            {t("refresh")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
        <Card key={school.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-blue-600" />
              {school.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t("classes")}</span>
              </div>
              <Badge variant="secondary">{school.class_count}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm">{t("students")}</span>
              </div>
              <Badge variant="outline">{school.student_count}</Badge>
            </div>
            
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => handleManageClasses(school.id)}
                className="w-full"
                size="sm"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {t("manage-classes")}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onViewSchoolPool(school.id)}
                className="w-full"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("view-pokemon-pool")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SchoolsGrid;
