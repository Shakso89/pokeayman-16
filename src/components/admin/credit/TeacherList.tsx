
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TeacherCredit } from "@/types/teacher";
import { useTranslation } from "@/hooks/useTranslation";

interface TeacherListProps {
  isLoading: boolean;
  error: string | null;
  filteredTeachers: TeacherCredit[];
  selectedTeacher: TeacherCredit | null;
  onSelectTeacher: (teacher: TeacherCredit) => void;
  onRetry: () => void;
}

const TeacherList: React.FC<TeacherListProps> = ({
  isLoading,
  error,
  filteredTeachers,
  selectedTeacher,
  onSelectTeacher,
  onRetry,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <p className="text-center text-gray-500 p-4">
        {t("loading") || "Loading..."}
      </p>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
        {error}
        <button
          className="ml-2 text-sm underline text-red-600"
          onClick={onRetry}
        >
          {t("retry") || "Retry"}
        </button>
      </div>
    );
  }

  if (filteredTeachers.length === 0) {
    return (
      <p className="text-center text-gray-500 p-4">
        {t("no-teachers-found") || "No teachers found"}
      </p>
    );
  }

  return (
    <>
      {filteredTeachers.map((teacher) => (
        <div
          key={teacher.teacherId}
          className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
            selectedTeacher?.teacherId === teacher.teacherId
              ? "bg-blue-100 dark:bg-blue-900"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
          onClick={() => onSelectTeacher(teacher)}
        >
          <div>
            <p className="font-medium">{teacher.username}</p>
            <p className="text-xs text-gray-500">{teacher.teacherId}</p>
          </div>
          <Badge className="bg-green-600">
            {teacher.credits} Credits
          </Badge>
        </div>
      ))}
    </>
  );
};

export default TeacherList;
