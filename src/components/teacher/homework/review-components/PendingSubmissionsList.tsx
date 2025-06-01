
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PendingSubmissionsListProps {
  pendingSubmissions: HomeworkSubmission[];
  activeHomework: HomeworkAssignment[];
  classes: { id: string, name: string }[];
  selectedSubmission: HomeworkSubmission | null;
  onSelectSubmission: (submission: HomeworkSubmission) => void;
}

export const PendingSubmissionsList: React.FC<PendingSubmissionsListProps> = ({
  pendingSubmissions,
  activeHomework,
  classes,
  selectedSubmission,
  onSelectSubmission
}) => {
  const { t } = useTranslation();

  const getClassName = (classId: string) => {
    const foundClass = classes?.find(c => c.id === classId);
    return foundClass?.name || t("unknown-class");
  };

  const getHomeworkForSubmission = (submissionId: string) => {
    const submission = pendingSubmissions.find(s => s.id === submissionId);
    if (!submission) return null;
    return activeHomework.find(hw => hw.id === submission.homeworkId);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">{t("pending-submissions")}</h4>
      {pendingSubmissions.map(submission => {
        const homework = getHomeworkForSubmission(submission.id);
        if (!homework) {
          console.log("No homework found for submission:", submission.id, submission.homeworkId);
          return null;
        }

        return (
          <Card 
            key={submission.id} 
            className={`cursor-pointer transition-colors ${
              selectedSubmission?.id === submission.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectSubmission(submission)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm">{homework.title}</CardTitle>
                  <p className="text-xs text-gray-500">{getClassName(homework.classId)}</p>
                </div>
                <Badge variant="outline">{submission.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{submission.studentName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
