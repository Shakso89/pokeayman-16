
import React from "react";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { TeacherHomeworkCard } from "./TeacherHomeworkCard";
import { useTranslation } from "@/hooks/useTranslation";

interface ArchivedHomeworkTabProps {
  archivedHomework: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  getClassNameById: (classId: string) => string;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onNavigateToStudentProfile: (studentId: string) => void;
}

const ArchivedHomeworkTab: React.FC<ArchivedHomeworkTabProps> = ({
  archivedHomework,
  submissions,
  getClassNameById,
  onAwardCoins,
  onDeleteHomework,
  onNavigateToStudentProfile,
}) => {
  const { t } = useTranslation();
  
  // Dummy functions for approval/rejection since archived homework doesn't need these
  const dummyApprove = () => {};
  const dummyReject = () => {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {archivedHomework && archivedHomework.length > 0 ? (
        archivedHomework.map(homework => (
          <TeacherHomeworkCard
            key={homework.id}
            homework={homework}
            className={getClassNameById(homework.classId)}
            submissions={submissions.filter(sub => sub.homeworkId === homework.id)}
            onApproveSubmission={dummyApprove}
            onRejectSubmission={dummyReject}
            onAwardCoins={onAwardCoins}
            onDeleteHomework={onDeleteHomework}
            onNavigateToStudentProfile={onNavigateToStudentProfile}
            isActive={false}
          />
        ))
      ) : (
        <div className="col-span-2 text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t("no-archived-homework")}</p>
        </div>
      )}
    </div>
  );
};

export default ArchivedHomeworkTab;
