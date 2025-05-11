
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "teacher" | "student";
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  userType,
}) => {
  const { t } = useTranslation();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Load user data
    if (userType === "teacher") {
      const teacherId = localStorage.getItem("teacherId");
      if (teacherId) {
        setUserId(teacherId);
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const teacher = teachers.find((t: any) => t.id === teacherId);
        if (teacher) {
          setDisplayName(teacher.displayName || "");
          setAvatar(teacher.avatar || null);
        }
      }
    } else {
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        setUserId(studentId);
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const student = students.find((s: any) => s.id === studentId);
        if (student) {
          setDisplayName(student.displayName || "");
          setAvatar(student.avatar || null);
        }
      }
    }
  }, [userType, isOpen]);

  const handleSave = () => {
    if (userType === "teacher") {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacherIndex = teachers.findIndex((t: any) => t.id === userId);
      
      if (teacherIndex !== -1) {
        teachers[teacherIndex] = {
          ...teachers[teacherIndex],
          displayName,
          avatar,
        };
        localStorage.setItem("teachers", JSON.stringify(teachers));
        localStorage.setItem("teacherDisplayName", displayName);
        
        toast(t("settings-saved"));
      }
    } else {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const studentIndex = students.findIndex((s: any) => s.id === userId);
      
      if (studentIndex !== -1) {
        students[studentIndex] = {
          ...students[studentIndex],
          displayName,
          avatar,
        };
        localStorage.setItem("students", JSON.stringify(students));
        localStorage.setItem("studentName", displayName);
        
        toast(t("settings-saved"));
      }
    }
    
    onClose();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("user-settings")}</DialogTitle>
          <DialogDescription>
            {t("user-settings-description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar || undefined} />
                <AvatarFallback>
                  {displayName?.substring(0, 2).toUpperCase() || "NA"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">{t("display-name")}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave}>{t("save-changes")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModal;
