
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SchoolInfoCardProps {
  schoolId: string;
  teacherId: string;
  isAdmin: boolean;
}

const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({ schoolId, teacherId, isAdmin }) => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("school-information")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center">
          <School className="h-5 w-5 mr-2 text-blue-500" />
          <span className="font-medium">{t("school-id")}:</span>
          <span className="ml-2 text-gray-600">{schoolId}</span>
        </div>
        <div className="flex items-center">
          <User className="h-5 w-5 mr-2 text-green-500" />
          <span className="font-medium">{t("teacher-id")}:</span>
          <span className="ml-2 text-gray-600">{isAdmin ? "Admin (No teacher ID)" : teacherId}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolInfoCard;
