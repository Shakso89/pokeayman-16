
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
import { UserCog } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentPokemonCollection } from "@/utils/pokemon";
import ProfileTab from "./settings/ProfileTab";
import SecurityTab from "./settings/SecurityTab";

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
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // Load user data when modal opens
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, userType]);

  const loadUserData = () => {
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
        
        // Load student coins
        const collection = getStudentPokemonCollection(studentId);
        if (collection) {
          setCoins(collection.coins || 0);
        }
      }
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            {t("profile-and-settings")}
          </DialogTitle>
          <DialogDescription>
            {t("user-settings-description")}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
            <TabsTrigger value="security">{t("security")}</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab
              userId={userId}
              displayName={displayName}
              avatar={avatar}
              coins={coins}
              userType={userType}
              setDisplayName={setDisplayName}
              setAvatar={setAvatar}
              onClose={onClose}
            />
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <SecurityTab onClose={onClose} />
          </TabsContent>
        </Tabs>
        
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
