
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeacherCard from "./TeacherCard";

export interface AdminTeacherData {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
  timeSpent?: number;
  numSchools?: number;
  numStudents?: number;
  subscriptionType: 'trial' | 'monthly' | 'annual';
  expiryDate?: string;
}

interface TeachersTabProps {
  teachers: AdminTeacherData[];
  setTeachers: React.Dispatch<React.SetStateAction<AdminTeacherData[]>>;
  t: (key: string, fallback?: string) => string;
}

const TeachersTab: React.FC<TeachersTabProps> = ({ teachers, setTeachers, t }) => {
  const [processingIds, setProcessingIds] = useState<Record<string, "toggle" | "delete">>({});

  const handleToggleAccount = async (userId: string) => {
    if (processingIds[userId]) return;
    
    setProcessingIds((prev) => ({ ...prev, [userId]: "toggle" }));
    
    try {
      const teacher = teachers.find((t) => t.id === userId);
      if (!teacher) throw new Error("Teacher not found");
      
      const newIsActive = !teacher.isActive;
      
      const { error } = await supabase
        .from("teachers")
        .update({ is_active: newIsActive })
        .eq("id", userId);
        
      if (error) throw error;
      
      setTeachers((prev) =>
        prev.map((t) => (t.id === userId ? { ...t, isActive: newIsActive } : t))
      );
      
      toast({
        title: t("account-updated", "Account updated"),
        description: newIsActive
          ? t("account-activated", "Account has been activated")
          : t("account-frozen", "Account has been frozen"),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update account";
      console.error("Toggle Error:", message);
      toast({
        title: t("error", "Error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    const confirm = window.confirm(
      t("confirm-delete", "Are you sure you want to delete this account? This action cannot be undone.")
    );
    if (!confirm) return;
    
    setProcessingIds((prev) => ({ ...prev, [userId]: "delete" }));
    
    try {
      const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", userId);
        
      if (error) throw error;
      
      setTeachers((prev) => prev.filter((t) => t.id !== userId));
      
      toast({
        title: t("account-deleted", "Account deleted"),
        description: t("account-deleted-desc", "Account has been permanently deleted"),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete account";
      console.error("Delete Error:", message);
      toast({
        title: t("error", "Error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }
  };

  return (
    <div className="grid gap-4">
      {teachers.length === 0 ? (
        <p className="text-center py-8 text-gray-500">{t("no-teachers", "No teachers found")}</p>
      ) : (
        teachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            processing={processingIds[teacher.id] || null}
            t={t}
            onToggle={() => handleToggleAccount(teacher.id)}
            onDelete={() => handleDeleteAccount(teacher.id)}
          />
        ))
      )}
    </div>
  );
};

export default TeachersTab;
