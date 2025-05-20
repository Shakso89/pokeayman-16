
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";
import { saveHomeworkSubmission } from "./utils";
import { v4 as uuidv4 } from "uuid";

export interface SubmitHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: HomeworkAssignment;
  studentId: string;
  studentName: string;
  onSubmissionComplete: () => void;
}

const SubmitHomeworkDialog: React.FC<SubmitHomeworkDialogProps> = ({
  open,
  onOpenChange,
  homework,
  studentId,
  studentName,
  onSubmissionComplete
}) => {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    
    const submission = {
      id: uuidv4(),
      homeworkId: homework.id,
      studentId,
      studentName,
      answer,
      submittedAt: new Date().toISOString(),
      teacherComment: null,
      grade: null,
      status: "submitted"
    };
    
    try {
      await saveHomeworkSubmission(submission);
      onSubmissionComplete();
    } catch (error) {
      console.error("Error submitting homework:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("submit-homework")}</DialogTitle>
          <DialogDescription>
            {homework.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <div className="mb-4 text-sm">
              <p className="font-medium mb-2">{t("assignment")}:</p>
              <p>{homework.description}</p>
            </div>
            
            <Label htmlFor="answer" className="mb-2 block">
              {t("your-answer")}:
            </Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t("type-your-answer-here")}
              className="min-h-32"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitHomeworkDialog;
