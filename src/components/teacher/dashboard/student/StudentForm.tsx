
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentFormProps {
  studentData: {
    username: string;
    password: string;
    displayName: string;
  };
  setStudentData: React.Dispatch<React.SetStateAction<{
    username: string;
    password: string;
    displayName: string;
  }>>;
  isLoading: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  studentData,
  setStudentData,
  isLoading
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="studentUsername">{t("username")}</Label>
        <Input
          id="studentUsername"
          value={studentData.username}
          onChange={(e) => setStudentData({...studentData, username: e.target.value})}
          placeholder={t("student-username")}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="studentDisplayName">{t("display-name")}</Label>
        <Input
          id="studentDisplayName"
          value={studentData.displayName}
          onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
          placeholder={t("student-display-name")}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="studentPassword">{t("password")}</Label>
        <Input
          id="studentPassword"
          type="password"
          value={studentData.password}
          onChange={(e) => setStudentData({...studentData, password: e.target.value})}
          placeholder={t("create-password")}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default StudentForm;
