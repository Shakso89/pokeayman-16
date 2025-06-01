
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PendingSubmissionsList } from "./review-components/PendingSubmissionsList";
import { SubmissionReviewPanel } from "./review-components/SubmissionReviewPanel";

interface ReviewHomeworkTabProps {
  activeHomework: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: { id: string, name: string }[];
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission, feedback: string) => void;
}

const ReviewHomeworkTab: React.FC<ReviewHomeworkTabProps> = ({
  activeHomework,
  submissions,
  classes,
  onApproveSubmission,
  onRejectSubmission
}) => {
  const { t } = useTranslation();
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);

  // Debug logging
  console.log("ReviewHomeworkTab - activeHomework:", activeHomework);
  console.log("ReviewHomeworkTab - submissions:", submissions);
  console.log("ReviewHomeworkTab - classes:", classes);

  const getHomeworkForSubmission = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return null;
    return activeHomework.find(hw => hw.id === submission.homeworkId);
  };

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  
  console.log("Filtered pending submissions:", pendingSubmissions);

  const handleApprove = (submission: HomeworkSubmission) => {
    onApproveSubmission(submission);
    setSelectedSubmission(null);
  };

  const handleReject = (submission: HomeworkSubmission, feedback: string) => {
    onRejectSubmission(submission, feedback);
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("review-homework-submissions")}</h3>
        <Badge variant="secondary">{pendingSubmissions.length} pending reviews</Badge>
      </div>

      {pendingSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">{t("no-pending-submissions")}</p>
            <p className="text-sm text-gray-400 mt-2">
              Debug: Total submissions: {submissions.length}, Active homework: {activeHomework.length}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <PendingSubmissionsList
            pendingSubmissions={pendingSubmissions}
            activeHomework={activeHomework}
            classes={classes}
            selectedSubmission={selectedSubmission}
            onSelectSubmission={setSelectedSubmission}
          />

          {/* Submission Review Panel */}
          <SubmissionReviewPanel
            selectedSubmission={selectedSubmission}
            homework={selectedSubmission ? getHomeworkForSubmission(selectedSubmission.id) : null}
            onApproveSubmission={handleApprove}
            onRejectSubmission={handleReject}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewHomeworkTab;
