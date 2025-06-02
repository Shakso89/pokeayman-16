
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

  const getHomeworkForSubmission = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return null;
    
    const homework = activeHomework.find(hw => hw.id === submission.homeworkId);
    return homework;
  };

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  
  console.log("ReviewHomeworkTab - Active homework:", activeHomework.length);
  console.log("ReviewHomeworkTab - Total submissions:", submissions.length);
  console.log("ReviewHomeworkTab - Pending submissions:", pendingSubmissions.length);
  console.log("ReviewHomeworkTab - All submissions status:", submissions.map(s => ({id: s.id, status: s.status, studentName: s.studentName})));

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
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={pendingSubmissions.length > 0 ? "bg-orange-100 text-orange-800" : ""}>
            {pendingSubmissions.length} pending reviews
          </Badge>
          <Badge variant="outline">
            {submissions.length} total submissions
          </Badge>
        </div>
      </div>

      {pendingSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">{t("no-pending-submissions")}</p>
            <div className="text-sm text-gray-400 mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Debug Information:</p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p>📚 Active homework: {activeHomework.length}</p>
                  <p>🎯 Total submissions: {submissions.length}</p>
                  <p>⏳ Pending submissions: {pendingSubmissions.length}</p>
                </div>
                <div>
                  <p>🏫 Classes: {classes.length}</p>
                  <p>📊 Submission statuses:</p>
                  <div className="ml-2">
                    {submissions.length === 0 ? (
                      <p>• No submissions found</p>
                    ) : (
                      submissions.reduce((acc, sub) => {
                        acc[sub.status] = (acc[sub.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ) && Object.entries(
                      submissions.reduce((acc, sub) => {
                        acc[sub.status] = (acc[sub.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <p key={status}>• {status}: {count}</p>
                    ))}
                  </div>
                </div>
              </div>
              {submissions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="font-medium mb-1">Recent submissions:</p>
                  {submissions.slice(0, 3).map(sub => (
                    <p key={sub.id} className="text-xs">
                      • {sub.studentName} - {sub.status} ({new Date(sub.submittedAt).toLocaleDateString()})
                    </p>
                  ))}
                </div>
              )}
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
