
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
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentPokemonCollection } from "@/utils/pokemon";
import ProfileTab from "./settings/ProfileTab";
import SecurityTab from "./settings/SecurityTab";
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
  const [coins, setCoins] = useState(0);
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Load user data when modal opens
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, userType]);

  const loadUserData = async () => {
    if (userType === "teacher") {
      const teacherId = localStorage.getItem("teacherId");
      if (teacherId) {
        setUserId(teacherId);
        
        // Check if teacherId is from Supabase (not starting with 'admin-')
        if (!teacherId.startsWith('admin-')) {
          try {
            // Get teacher data from Supabase
            const { data: teacher, error } = await supabase
              .from('teachers')
              .select('display_name, avatar_url')
              .eq('id', teacherId)
              .maybeSingle();
            
            if (teacher && !error) {
              setDisplayName(teacher.display_name || '');
              setOriginalDisplayName(teacher.display_name || '');
              setAvatar(teacher.avatar_url || null);
              setOriginalAvatar(teacher.avatar_url || null);
              return;
            }
          } catch (error) {
            console.error("Error loading teacher data from Supabase:", error);
          }
        }
        
        // Fallback to localStorage
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const teacher = teachers.find((t: any) => t.id === teacherId);
        if (teacher) {
          setDisplayName(teacher.displayName || "");
          setOriginalDisplayName(teacher.displayName || "");
          setAvatar(teacher.avatar_url || null);
          setOriginalAvatar(teacher.avatar_url || null);
        }
      }
    } else {
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        setUserId(studentId);
        
        // Try to get student data from Supabase
        try {
          const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .maybeSingle();
          
          if (student && !error) {
            setDisplayName(student.display_name || student.username || '');
            setOriginalDisplayName(student.display_name || student.username || '');
            return;
          }
        } catch (error) {
          console.error("Error loading student data from Supabase:", error);
        }
        
        // Fallback to localStorage
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const student = students.find((s: any) => s.id === studentId);
        if (student) {
          setDisplayName(student.displayName || student.username || "");
          setOriginalDisplayName(student.displayName || student.username || "");
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

  const handleSave = async () => {
    // Only update if display name or avatar has changed
    if (displayName !== originalDisplayName || avatar !== originalAvatar) {
      if (userType === "teacher") {
        const teacherId = localStorage.getItem("teacherId");
        
        // Update in Supabase if not an admin user
        if (teacherId && !teacherId.startsWith('admin-')) {
          try {
            const { error } = await supabase
              .from('teachers')
              .update({ display_name: displayName, avatar_url: avatar })
              .eq('id', teacherId);
            
            if (error) throw error;
          } catch (error) {
            console.error("Error updating teacher in Supabase:", error);
          }
        }
        
        // Also update in localStorage for backward compatibility
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const teacherIndex = teachers.findIndex((t: any) => t.id === userId);
        
        if (teacherIndex !== -1) {
          teachers[teacherIndex] = {
            ...teachers[teacherIndex],
            displayName,
            avatar_url: avatar,
          };
          localStorage.setItem("teachers", JSON.stringify(teachers));
          localStorage.setItem("teacherDisplayName", displayName);
        }
      } else {
        const studentId = localStorage.getItem("studentId");
        
        // Update in Supabase
        if (studentId) {
          try {
            const { error } = await supabase
              .from('students')
              .update({ display_name: displayName })
              .eq('id', studentId);
            
            if (error) throw error;
          } catch (error) {
            console.error("Error updating student in Supabase:", error);
          }
        }
        
        // Also update in localStorage
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const studentIndex = students.findIndex((s: any) => s.id === userId);
        
        if (studentIndex !== -1) {
          students[studentIndex] = {
            ...students[studentIndex],
            displayName,
            avatar,
          };
          localStorage.setItem("students", JSON.stringify(students));
          localStorage.setItem("studentDisplayName", displayName);
        }
      }
      
      toast({
        title: t("success"),
        description: t("settings-saved"),
      });
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
