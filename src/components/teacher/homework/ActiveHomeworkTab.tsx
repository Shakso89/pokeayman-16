
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { TeacherHomeworkCard } from "./TeacherHomeworkCard";

interface ActiveHomeworkTabProps {
  activeHomework: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: { id: string, name: string }[];
  onAwardCoins: (studentId: string, studentName: string) => void;
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onNavigateToStudentProfile: (studentId: string) => void;
  onCreateHomework: (classId: string, className: string) => void;
}

const ActiveHomeworkTab: React.FC<ActiveHomeworkTabProps> = ({
  activeHomework,
  submissions,
  classes,
  onAwardCoins,
  onApproveSubmission,
  onRejectSubmission,
  onDeleteHomework,
  onNavigateToStudentProfile,
  onCreateHomework
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Get class name for a homework
  const getClassName = (classId: string) => {
    const foundClass = classes?.find(c => c.id === classId);
    return foundClass?.name || t("unknown-class");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {activeHomework && activeHomework.length > 0 ? (
        activeHomework.map(homework => (
          <TeacherHomeworkCard
            key={homework.id}
            homework={homework}
            className={getClassName(homework.classId)}
            submissions={submissions.filter(sub => sub.homeworkId === homework.id)}
            onApproveSubmission={onApproveSubmission}
            onRejectSubmission={onRejectSubmission}
            onAwardCoins={onAwardCoins}
            onDeleteHomework={onDeleteHomework}
            onNavigateToStudentProfile={onNavigateToStudentProfile}
            isActive={true}
          />
        ))
      ) : (
        <div className="col-span-2 text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t("no-active-homework")}</p>
          {classes && classes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">{t("create-homework-for-class")}:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => onCreateHomework(cls.id, cls.name)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveHomeworkTab;
