
import React, { useState, useEffect } from "react";
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
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(classId);
  
  const [homeworkData, setHomeworkData] = useState({
    title: "",
    description: "",
    type: "text" as "text" | "image" | "audio",
    coinReward: 10
  });

  // Fetch available classes when dialog opens
  useEffect(() => {
    if (open) {
      fetchClasses();
      // Initialize selected class to the provided classId
      setSelectedClassId(classId);
    }
  }, [open, classId]);

  const fetchClasses = () => {
    try {
      // First try to get classes from localStorage
      const storedClasses = localStorage.getItem("classes");
      if (storedClasses) {
        const parsedClasses = JSON.parse(storedClasses);
        // Filter classes by teacherId if teacherId is provided
        const filteredClasses = teacherId 
          ? parsedClasses.filter((cls: any) => 
              cls.teacherId === teacherId || cls.teacher_id === teacherId
            )
          : parsedClasses;
        
        // Map to a simple format with id and name
        setClasses(filteredClasses.map((cls: any) => ({
          id: cls.id,
          name: cls.name
        })));
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

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

    if (!selectedClassId) {
      toast({
        title: t("error"),
        description: t("select-class"),
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
      classId: selectedClassId,
      teacherId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      coinReward: homeworkData.coinReward
    };
    
    // Save homework to localStorage
    const homeworkAssignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    homeworkAssignments.push(newHomework);
    localStorage.setItem("homeworkAssignments", JSON.stringify(homeworkAssignments));
    
    console.log("Created homework for class:", selectedClassId, "Homework:", newHomework);
    
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
          {/* Class Selection Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="class">{t("select-class")}</Label>
            <Select 
              value={selectedClassId} 
              onValueChange={(value) => setSelectedClassId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select-a-class")} />
              </SelectTrigger>
              <SelectContent>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-classes" disabled>
                    {t("no-classes-available")}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
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
                <ImageIcon className="mr-2 h-4 w-4" />
                {t("image")}
              </Button>
              <Button
                type="button"
                variant={homeworkData.type === "audio" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setHomeworkData({...homeworkData, type: "audio"})}
              >
                <MicIcon className="mr-2 h-4 w-4" />
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

// Create Icon components for image and mic with proper props type
interface IconProps {
  className?: string;
}

const ImageIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

export default CreateHomeworkDialog;
