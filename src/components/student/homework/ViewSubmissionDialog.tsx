
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission, HomeworkAssignment } from "@/types/homework";
import { CheckCircle, XCircle, Clock, Coins } from "lucide-react";

interface ViewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: HomeworkSubmission | null;
  homework: HomeworkAssignment;
}

const ViewSubmissionDialog: React.FC<ViewSubmissionDialogProps> = ({
  open,
  onOpenChange,
  submission,
  homework
}) => {
  const { t } = useTranslation();

  // Early return if submission is null
  if (!submission) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("no-submission")}</DialogTitle>
            <DialogDescription>
              {t("no-submission-found")}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusIcon = () => {
    switch (submission.status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (submission.status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const renderContent = () => {
    switch (submission.type) {
      case "image":
        return (
          <div className="mt-4">
            <img 
              src={submission.content} 
              alt="Submission" 
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        );
      case "audio":
        return (
          <div className="mt-4">
            <audio controls className="w-full">
              <source src={submission.content} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "multiple_choice":
        const answers = submission.answers || [];
        return (
          <div className="mt-4 space-y-4">
            {homework.questions?.map((question, qIndex) => (
              <div key={question.id} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{question.question}</h4>
                <div className="space-y-1">
                  {question.options.map((option, oIndex) => {
                    const isSelected = answers[qIndex]?.includes(oIndex);
                    return (
                      <div 
                        key={oIndex}
                        className={`p-2 rounded ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}
                      >
                        {isSelected && <span className="font-medium">✓ </span>}
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="whitespace-pre-wrap">{submission.content}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {t("your-submission")}
          </DialogTitle>
          <DialogDescription>
            {homework.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor()}>
              {submission.status === "approved" && t("approved")}
              {submission.status === "rejected" && t("rejected")}
              {submission.status === "pending" && t("pending-review")}
            </Badge>
            
            {submission.status === "approved" && (
              <div className="flex items-center gap-1 text-amber-600">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">+{homework.coinReward} coins</span>
              </div>
            )}
          </div>
          
          {/* Submission Date */}
          <div className="text-sm text-gray-500">
            {t("submitted")}: {new Date(submission.submittedAt).toLocaleString()}
          </div>
          
          {/* Content */}
          {renderContent()}
          
          {/* Feedback */}
          {submission.feedback && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{t("teacher-feedback")}:</h4>
              <p className="text-blue-800">{submission.feedback}</p>
            </div>
          )}
          
          {submission.status === "pending" && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-sm">
                {t("submission-under-review")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionDialog;
