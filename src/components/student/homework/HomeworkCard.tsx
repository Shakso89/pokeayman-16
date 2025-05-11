
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Mic, FileUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";

interface HomeworkCardProps {
  homework: HomeworkAssignment;
  className: string;
  submitted: boolean;
  status: string | null;
  isExpired: boolean;
  onSubmit: () => void;
  onViewSubmission: () => void;
  now: Date;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  className,
  submitted,
  status,
  isExpired,
  onSubmit,
  onViewSubmission,
  now
}) => {
  const { t } = useTranslation();
  
  // Get homework type icon
  const getHomeworkTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-5 w-5 text-blue-500" />;
      case "image": return <Image className="h-5 w-5 text-green-500" />;
      case "audio": return <Mic className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className={isExpired ? "opacity-70" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getHomeworkTypeIcon(homework.type)}
          <CardTitle className="text-base">{homework.title}</CardTitle>
        </div>
        <CardDescription>
          <div className="flex justify-between items-center">
            <span>
              {!isExpired ? (
                <>{t("due")} {new Date(homework.expiresAt).toLocaleDateString()} ({Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60))} {t("hours")})</>
              ) : (
                <span className="text-red-500">{t("expired")}</span>
              )}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {className}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{homework.description}</p>
        <p className="text-sm font-medium">
          {t("reward")}: <span className="text-amber-500">{homework.coinReward} {t("coins")}</span>
        </p>
      </CardContent>
      <CardFooter>
        {submitted ? (
          <div className="w-full space-y-2">
            <div className={`text-sm px-3 py-2 rounded-md w-full text-center ${
              status === "approved" 
                ? "bg-green-100 text-green-800" 
                : status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {status === "approved" 
                ? t("submission-approved") 
                : status === "rejected"
                ? t("submission-rejected")
                : t("submission-pending")}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onViewSubmission}
            >
              {t("view-submission")}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            disabled={isExpired}
            onClick={onSubmit}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {t("submit-answer")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default HomeworkCard;
