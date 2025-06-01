
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HomeworkSubmission, HomeworkAssignment } from "@/types/homework";
import { Check, X, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SubmissionReviewCardProps {
  submission: HomeworkSubmission;
  homework: HomeworkAssignment;
  className?: string;
  onApprove: (submission: HomeworkSubmission) => void;
  onReject: (submission: HomeworkSubmission) => void;
  onView: (submission: HomeworkSubmission) => void;
  isSelected: boolean;
}

export const SubmissionReviewCard: React.FC<SubmissionReviewCardProps> = ({
  submission,
  homework,
  className,
  onApprove,
  onReject,
  onView,
  isSelected
}) => {
  const { t } = useTranslation();

  const getTypeIcon = () => {
    switch (submission.type) {
      case "image":
        return "🖼️";
      case "audio":
        return "🎵";
      case "multiple_choice":
        return "✅";
      default:
        return "📝";
    }
  };

  return (
    <Card 
      className={`transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {submission.studentName}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {getTypeIcon()} {submission.type}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(submission.submittedAt).toLocaleDateString()} • {homework.title}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(submission)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            {t("view")}
          </Button>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApprove(submission)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(submission)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-amber-600 font-medium">
          Reward: {homework.coinReward} coins
        </div>
      </CardContent>
    </Card>
  );
};
