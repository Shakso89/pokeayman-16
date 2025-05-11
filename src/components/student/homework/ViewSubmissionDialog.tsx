
import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";

interface ViewSubmissionDialogProps {
  submission: HomeworkSubmission | null;
  onClose: () => void;
}

export const ViewSubmissionDialog: React.FC<ViewSubmissionDialogProps> = ({
  submission,
  onClose
}) => {
  const { t } = useTranslation();
  
  const isOpen = !!submission;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("your-submission")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {submission && (
            <>
              {submission.type === "image" && submission.content.startsWith('data:image/') && (
                <div className="flex justify-center">
                  <img 
                    src={submission.content} 
                    alt="Your submission" 
                    className="max-h-80 rounded-md"
                  />
                </div>
              )}
              
              {submission.type === "audio" && submission.content.startsWith('data:audio/') && (
                <div className="flex justify-center">
                  <audio 
                    src={submission.content} 
                    controls 
                    className="w-full"
                  />
                </div>
              )}
              
              {submission.type === "text" && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p>{submission.content}</p>
                </div>
              )}
              
              {submission.status !== "pending" && (
                <div className="mt-4">
                  <p className="font-medium text-sm">{t("teacher-feedback")}:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                    {submission.feedback || t("no-feedback-provided")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionDialog;
