
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Image, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";

interface CreateHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHomeworkCreated: (homework: HomeworkAssignment) => void;
  teacherId: string;
  classId: string;
  className: string;
}

const CreateHomeworkDialog: React.FC<CreateHomeworkDialogProps> = ({
  open,
  onOpenChange,
  onHomeworkCreated,
  teacherId,
  classId,
  className
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [homeworkData, setHomeworkData] = useState({
    title: "",
    description: "",
    type: "text" as "text" | "image" | "audio",
    coinReward: 10
  });

  const handleCreateHomework = () => {
    // Validate homework data
    if (!homeworkData.title || !homeworkData.description) {
      toast({
        title: t("error"),
        description: t("fill-all-fields"),
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
    
    const newHomework: HomeworkAssignment = {
      id: `homework-${Date.now()}`,
      title: homeworkData.title,
      description: homeworkData.description,
      type: homeworkData.type,
      classId: classId,
      teacherId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      coinReward: homeworkData.coinReward
    };
    
    // Save homework to localStorage
    const homeworkAssignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    homeworkAssignments.push(newHomework);
    localStorage.setItem("homeworkAssignments", JSON.stringify(homeworkAssignments));
    
    // Call the callback
    onHomeworkCreated(newHomework);
    
    // Reset form and close dialog
    setHomeworkData({
      title: "",
      description: "",
      type: "text",
      coinReward: 10
    });
    
    toast({
      title: t("success"),
      description: t("homework-created"),
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("create-homework")}</DialogTitle>
          <DialogDescription>
            {t("create-homework-for")} {className}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("title")}</Label>
            <Input
              id="title"
              value={homeworkData.title}
              onChange={(e) => setHomeworkData({...homeworkData, title: e.target.value})}
              placeholder={t("homework-title")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={homeworkData.description}
              onChange={(e) => setHomeworkData({...homeworkData, description: e.target.value})}
              placeholder={t("homework-instructions")}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t("homework-type")}</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={homeworkData.type === "text" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setHomeworkData({...homeworkData, type: "text"})}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("text")}
              </Button>
              <Button
                type="button"
                variant={homeworkData.type === "image" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setHomeworkData({...homeworkData, type: "image"})}
              >
                <Image className="mr-2 h-4 w-4" />
                {t("image")}
              </Button>
              <Button
                type="button"
                variant={homeworkData.type === "audio" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setHomeworkData({...homeworkData, type: "audio"})}
              >
                <Mic className="mr-2 h-4 w-4" />
                {t("audio")}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coinReward">{t("coin-reward")}</Label>
            <Input
              id="coinReward"
              type="number"
              value={homeworkData.coinReward}
              onChange={(e) => setHomeworkData({...homeworkData, coinReward: parseInt(e.target.value) || 0})}
              min={1}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreateHomework}>
            {t("create-homework")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHomeworkDialog;
