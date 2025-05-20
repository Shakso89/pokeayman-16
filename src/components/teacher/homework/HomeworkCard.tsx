
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeworkSubmissionItem } from "./HomeworkSubmissionItem";
import { getHomeworkTypeIcon } from "./HomeworkUtils";

interface HomeworkCardProps {
  homework: HomeworkAssignment;
  className: string;
  submissions: HomeworkSubmission[];
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission) => void;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onNavigateToStudentProfile: (studentId: string) => void;
  isActive: boolean;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  className,
  submissions,
  onApproveSubmission,
  onRejectSubmission,
  onAwardCoins,
  onDeleteHomework,
  onNavigateToStudentProfile,
  isActive
}) => {
  const { t } = useTranslation();
  const now = new Date();
  const hoursRemaining = isActive ? 
    Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60)) : 0;

  // Filter submissions for this homework
  const homeworkSubmissions = submissions.filter(
    submission => submission.homeworkId === homework.id
  );

  return (
    <Card key={homework.id} className={!isActive ? "bg-gray-50" : "overflow-hidden"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getHomeworkTypeIcon(homework.type)}
            <CardTitle className={!isActive ? "ml-2 text-gray-600" : "ml-2"}>{homework.title}</CardTitle>
          </div>
          <div className={!isActive ? 
            "px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium" : 
            "px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"}>
            {className}
          </div>
        </div>
        <CardDescription className="mt-2">
          {isActive ? (
            <>{new Date(homework.createdAt).toLocaleDateString()} - {t("expires-in")} {hoursRemaining} {t("hours")}</>
          ) : (
            <>{t("expired")}: {new Date(homework.expiresAt).toLocaleDateString()}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{homework.description}</p>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium mb-2">{t("submissions")}: {homeworkSubmissions.length}</p>
          {homeworkSubmissions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-auto">
              {homeworkSubmissions.map(submission => (
                <HomeworkSubmissionItem 
                  key={submission.id}
                  submission={submission}
                  onApprove={onApproveSubmission}
                  onReject={onRejectSubmission}
                  onAwardCoins={onAwardCoins}
                  onNavigateToProfile={onNavigateToStudentProfile}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("no-submissions-yet")}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm">
          <span className="font-medium">{t("reward")}:</span> {homework.coinReward} {t("coins")}
        </div>
        <Button variant="outline" className="text-red-500" onClick={() => onDeleteHomework(homework.id)}>
          {isActive ? t("delete") : t("delete-permanently")}
        </Button>
      </CardFooter>
    </Card>
  );
};
