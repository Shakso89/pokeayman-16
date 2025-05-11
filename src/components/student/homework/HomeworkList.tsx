
import React from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { HomeworkCard } from "./HomeworkCard";

interface HomeworkListProps {
  homeworks: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: {[id: string]: string};
  onSubmit: (homework: HomeworkAssignment) => void;
  onViewSubmission: (homeworkId: string) => void;
  now: Date;
}

export const HomeworkList: React.FC<HomeworkListProps> = ({
  homeworks,
  submissions,
  classes,
  onSubmit,
  onViewSubmission,
  now
}) => {
  const { t } = useTranslation();

  // Check if student has submitted for a homework
  const hasSubmitted = (homeworkId: string) => {
    return submissions.some(sub => sub.homeworkId === homeworkId);
  };
  
  // Get submission status for a homework
  const getSubmissionStatus = (homeworkId: string) => {
    const submission = submissions.find(sub => sub.homeworkId === homeworkId);
    return submission ? submission.status : null;
  };

  if (homeworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p>{t("no-homework")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {homeworks.map(homework => {
        const submitted = hasSubmitted(homework.id);
        const status = getSubmissionStatus(homework.id);
        const isExpired = new Date(homework.expiresAt) <= now;
        
        return (
          <HomeworkCard
            key={homework.id}
            homework={homework}
            className={classes[homework.classId] || t("unknown-class")}
            submitted={submitted}
            status={status}
            isExpired={isExpired}
            onSubmit={() => onSubmit(homework)}
            onViewSubmission={() => onViewSubmission(homework.id)}
            now={now}
          />
        );
      })}
    </div>
  );
};

export default HomeworkList;
