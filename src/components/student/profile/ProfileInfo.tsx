
import React from "react";
import { User, School } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileInfoProps {
  displayName: string;
  username: string;
  teacherName: string;
  schoolName: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  displayName,
  username,
  teacherName,
  schoolName
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <p className="text-sm font-medium text-gray-500">{t("display-name")}:</p>
        <p>{displayName}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">{t("username")}:</p>
        <p>{username}</p>
      </div>

      {/* Teacher information */}
      <div>
        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
          <User size={14} className="text-blue-500" /> {t("teacher")}:
        </p>
        <p>{teacherName}</p>
      </div>

      {/* School information */}
      <div>
        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
          <School size={14} className="text-blue-500" /> {t("school")}:
        </p>
        <p>{schoolName}</p>
      </div>
    </>
  );
};

export default ProfileInfo;
