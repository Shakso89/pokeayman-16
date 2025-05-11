
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmissionContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: HomeworkSubmission;
  isImage: boolean;
  isAudio: boolean;
}

export const SubmissionContentDialog: React.FC<SubmissionContentDialogProps> = ({
  open,
  onOpenChange,
  submission,
  isImage,
  isAudio
}) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("student-submission")}: {submission.studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isImage ? (
            <div className="flex justify-center">
              <img 
                src={submission.content} 
                alt={`${submission.studentName}'s submission`}
                className="max-h-96 max-w-full rounded-md"
              />
            </div>
          ) : isAudio ? (
            <div className="flex flex-col items-center space-y-4">
              <audio 
                src={submission.content} 
                controls 
                className="w-full"
                controlsList="nodownload"
              />
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = submission.content;
                  a.download = `${submission.studentName}_audio_submission.mp3`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                {t("download-audio")}
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              {submission.content}
            </div>
          )}
          
          {submission.feedback && (
            <div className="mt-4">
              <p className="font-medium text-sm">{t("teacher-feedback")}:</p>
              <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{submission.feedback}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
