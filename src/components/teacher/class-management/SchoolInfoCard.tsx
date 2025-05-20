import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { School, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SchoolInfoCardProps {
  schoolId: string;
  teacherId: string;
  isAdmin: boolean;
}

const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({ schoolId, teacherId, isAdmin }) => {
  const { t } = useTranslation();

  const infoItem = (icon: React.ReactNode, label: string, value: string) => (
    <div className="flex items-center space-x-2">
      {icon}
      <span className="font-medium">{label}:</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("school-information")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {infoItem(<School className="h-5 w-5 text-blue-500" />, t("school-id"), schoolId)}
        {infoItem(
          <User className="h-5 w-5 text-green-500" />,
          t("teacher-id"),
          isAdmin ? t("admin-no-teacher-id") : teacherId
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolInfoCard;
