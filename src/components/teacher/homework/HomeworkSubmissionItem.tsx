
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { Button } from "@/components/ui/button";
import { Check, X, Download, Coins } from "lucide-react";

interface HomeworkSubmissionItemProps {
  submission: HomeworkSubmission;
  onApprove?: (submission: HomeworkSubmission) => void;
  onReject?: (submission: HomeworkSubmission) => void;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onNavigateToProfile: (studentId: string) => void;
}

export const HomeworkSubmissionItem: React.FC<HomeworkSubmissionItemProps> = ({
  submission,
  onApprove,
  onReject,
  onAwardCoins,
  onNavigateToProfile
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-2 rounded border flex justify-between items-center">
      <div>
        <p 
          className="font-medium cursor-pointer hover:underline" 
          onClick={() => onNavigateToProfile(submission.studentId)}
        >
          {submission.studentName}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(submission.submittedAt).toLocaleString()}
        </p>
      </div>
      
      {submission.status === "pending" ? (
        <div className="flex space-x-1">
          <Button size="sm" variant="outline" onClick={() => window.open(submission.content, '_blank')}>
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-amber-500"
            onClick={() => onAwardCoins(submission.studentId, submission.studentName)}
          >
            <Coins className="h-4 w-4" />
          </Button>
          {onReject && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-500" 
              onClick={() => onReject(submission)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {onApprove && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-500" 
              onClick={() => onApprove(submission)}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs ${
            submission.status === 'approved' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {submission.status === 'approved' ? t("approved") : t("rejected")}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-amber-500"
            onClick={() => onAwardCoins(submission.studentId, submission.studentName)}
          >
            <Coins className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
