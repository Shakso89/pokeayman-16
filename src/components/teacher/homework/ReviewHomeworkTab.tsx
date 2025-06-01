
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

  // Debug logging with more detail
  console.log("=== ReviewHomeworkTab Debug ===");
  console.log("Active homework count:", activeHomework.length);
  console.log("Active homework:", activeHomework);
  console.log("Total submissions count:", submissions.length);
  console.log("All submissions:", submissions);
  console.log("Classes count:", classes.length);
  console.log("Classes:", classes);

  const getHomeworkForSubmission = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      console.log("No submission found for ID:", submissionId);
      return null;
    }
    
    const homework = activeHomework.find(hw => hw.id === submission.homeworkId);
    console.log("Found homework for submission:", homework ? homework.title : "NOT FOUND", "homeworkId:", submission.homeworkId);
    return homework;
  };

  const pendingSubmissions = submissions.filter(s => {
    console.log("Checking submission status:", s.id, s.status);
    return s.status === "pending";
  });
  
  console.log("Filtered pending submissions count:", pendingSubmissions.length);
  console.log("Pending submissions:", pendingSubmissions);

  const handleApprove = (submission: HomeworkSubmission) => {
    console.log("Approving submission:", submission.id);
    onApproveSubmission(submission);
    setSelectedSubmission(null);
  };

  const handleReject = (submission: HomeworkSubmission, feedback: string) => {
    console.log("Rejecting submission:", submission.id, "with feedback:", feedback);
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
            <div className="text-sm text-gray-400 mt-4 space-y-1">
              <p>Debug Info:</p>
              <p>Total submissions: {submissions.length}</p>
              <p>Active homework: {activeHomework.length}</p>
              <p>Classes: {classes.length}</p>
              <p>Submission statuses: {submissions.map(s => s.status).join(", ")}</p>
            </div>
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
