
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";
import { format } from "date-fns";

export interface ViewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: HomeworkAssignment;
  submission: any;
}

const ViewSubmissionDialog: React.FC<ViewSubmissionDialogProps> = ({
  open,
  onOpenChange,
  homework,
  submission
}) => {
  const { t } = useTranslation();
  
  if (!submission) return null;
  
  const submittedDate = new Date(submission.submittedAt);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("your-submission")}</DialogTitle>
          <DialogDescription>
            {homework.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-500">
              {t("submitted-on")} {format(submittedDate, "PPP p")}
            </p>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">{t("assignment")}:</h4>
              <p className="text-sm mb-4">{homework.description}</p>
              
              <h4 className="text-sm font-medium mb-1">{t("your-answer")}:</h4>
              <div className="border p-3 rounded-md bg-gray-50 text-sm whitespace-pre-wrap">
                {submission.answer}
              </div>
            </div>
            
            {submission.teacherComment && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">{t("teacher-feedback")}:</h4>
                <div className="border p-3 rounded-md bg-blue-50 text-sm whitespace-pre-wrap">
                  {submission.teacherComment}
                </div>
              </div>
            )}
            
            {submission.grade && (
              <div className="mt-4 flex items-center">
                <h4 className="text-sm font-medium mr-2">{t("grade")}:</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                  {submission.grade}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionDialog;
