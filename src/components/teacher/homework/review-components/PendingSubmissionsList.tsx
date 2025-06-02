
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
    return foundClass?.name || "Unknown Class";
  };

  const getHomeworkForSubmission = (submission: HomeworkSubmission) => {
    return activeHomework.find(hw => hw.id === submission.homeworkId);
  };

  console.log("PendingSubmissionsList - pendingSubmissions:", pendingSubmissions);
  console.log("PendingSubmissionsList - activeHomework:", activeHomework);

  if (pendingSubmissions.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium">{t("pending-submissions")}</h4>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No pending submissions to review</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">{t("pending-submissions")} ({pendingSubmissions.length})</h4>
      {pendingSubmissions.map(submission => {
        const homework = getHomeworkForSubmission(submission);
        
        if (!homework) {
          console.log("No homework found for submission:", submission.id, submission.homeworkId);
          return (
            <Card key={submission.id} className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <p className="text-red-600 text-sm">
                  Homework not found for submission by {submission.studentName}
                </p>
                <p className="text-xs text-gray-500">Submission ID: {submission.id}</p>
              </CardContent>
            </Card>
          );
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
                <div className="flex gap-1">
                  <Badge variant="outline">{submission.type}</Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{submission.studentName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
                  {new Date(submission.submittedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-400">
                  Expires: {new Date(homework.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
