
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
import { Camera, Coins } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentPokemonCollection } from "@/utils/pokemon";
import { supabase } from "@/integrations/supabase/client";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // Reset form state when modal opens or closes
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  }, [isOpen]);

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
        
        // Load student coins
        const collection = getStudentPokemonCollection(studentId);
        if (collection) {
          setCoins(collection.coins || 0);
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

  const validatePasswordChange = () => {
    setPasswordError("");
    
    if (!currentPassword) {
      setPasswordError(t("current-password-required"));
      return false;
    }
    
    if (!newPassword) {
      setPasswordError(t("new-password-required"));
      return false;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(t("password-too-short"));
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwords-do-not-match"));
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) return;
    
    setIsChangingPassword(true);
    
    try {
      // For now we'll simulate password change since we're using local storage
      // In a real app with Supabase, we would use:
      // await supabase.auth.updateUser({ password: newPassword })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t("password-changed-successfully"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t("error-changing-password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("user-settings")}</DialogTitle>
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
          <TabsContent value="profile" className="space-y-4 py-4">
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
            
            {/* Show coins for students */}
            {userType === "student" && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                <Coins className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">{t("current-coins")}</p>
                  <p className="text-2xl font-bold text-amber-600">{coins}</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("change-password")}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("current-password")}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("new-password")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirm-password")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              
              <Button 
                className="w-full" 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? t("changing-password") : t("change-password")}
              </Button>
            </div>
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
