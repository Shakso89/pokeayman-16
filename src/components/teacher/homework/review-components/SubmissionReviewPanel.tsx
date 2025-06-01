
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission, HomeworkAssignment } from "@/types/homework";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SubmissionContent } from "./SubmissionContent";
import { MultipleChoiceReview } from "./MultipleChoiceReview";

interface SubmissionReviewPanelProps {
  selectedSubmission: HomeworkSubmission | null;
  homework: HomeworkAssignment | null;
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission, feedback: string) => void;
}

export const SubmissionReviewPanel: React.FC<SubmissionReviewPanelProps> = ({
  selectedSubmission,
  homework,
  onApproveSubmission,
  onRejectSubmission
}) => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");

  const handleApprove = (submission: HomeworkSubmission) => {
    onApproveSubmission(submission);
    setFeedback("");
  };

  const handleReject = (submission: HomeworkSubmission) => {
    if (!feedback.trim()) {
      toast({
        title: t("error"),
        description: "Please provide feedback for rejection",
        variant: "destructive"
      });
      return;
    }
    onRejectSubmission(submission, feedback);
    setFeedback("");
  };

  const handleDownload = (content: string, type: string, studentName: string) => {
    const a = document.createElement('a');
    a.href = content;
    a.download = `${studentName}_submission.${type === 'audio' ? 'mp3' : type === 'image' ? 'png' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!selectedSubmission) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">{t("select-submission-to-review")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{selectedSubmission.studentName}'s Submission</span>
          <Badge variant="outline">{selectedSubmission.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Render content based on type */}
        {selectedSubmission.type === "multiple_choice" && homework ? (
          <MultipleChoiceReview 
            submission={selectedSubmission} 
            homework={homework}
          />
        ) : (
          <SubmissionContent 
            submission={selectedSubmission}
            onDownload={handleDownload}
          />
        )}

        {/* Feedback section */}
        <div className="space-y-2">
          <Label htmlFor="feedback">{t("feedback")} (optional for approval, required for rejection)</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t("provide-feedback-to-student")}
            rows={3}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleApprove(selectedSubmission)}
          >
            <Check className="h-4 w-4 mr-1" />
            {t("approve")}
          </Button>
          <Button 
            variant="destructive"
            onClick={() => handleReject(selectedSubmission)}
          >
            <X className="h-4 w-4 mr-1" />
            {t("reject")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
