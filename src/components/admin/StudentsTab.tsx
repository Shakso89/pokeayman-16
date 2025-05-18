import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/database";
import { Loader2 } from "lucide-react";

interface StudentData {
  id: string;
  username: string;
  display_name: string;
  teacher_id: string;
  created_at: string;
  last_login?: string;
  time_spent?: number;
  is_active: boolean;
}

interface StudentsTabProps {
  students: StudentData[];
  setStudents: React.Dispatch<React.SetStateAction<StudentData[]>>;
  t: (key: string, fallback?: string) => string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ students, setStudents, t }) => {
  const [processingIds, setProcessingIds] = useState<Record<string, "toggle" | "delete">>({});

  const updateProcessing = (id: string, action: "toggle" | "delete" | null) => {
    setProcessingIds((prev) => {
      const updated = { ...prev };
      if (action) {
        updated[id] = action;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const handleToggleAccount = async (userId: string) => {
    updateProcessing(userId, "toggle");
    try {
      const student = students.find((s) => s.id === userId);
      if (!student) throw new Error("Student not found");

      const newIsActive = !student.is_active;
      const { error } = await supabase
        .from("students")
        .update({ is_active: newIsActive } as Partial<Student>)
        .eq("id", userId);

      if (error) throw error;

      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, is_active: newIsActive } : s))
      );

      toast({
        title: t("student-updated", "Student account updated"),
        description: newIsActive
          ? t("account-activated", "Student account has been activated")
          : t("account-frozen", "Student account has been frozen"),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update student account";
      console.error("Toggle Error:", message);
      toast({
        title: t("error", "Error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      updateProcessing(userId, null);
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    const confirm = window.confirm(
      t("confirm-delete-student", "Are you sure you want to delete this student account? This action cannot be undone.")
    );
    if (!confirm) return;

    updateProcessing(userId, "delete");

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      setStudents((prev) => prev.filter((s) => s.id !== userId));

      toast({
        title: t("student-deleted", "Student account deleted"),
        description: t("student-deleted-desc", "Student account has been permanently deleted"),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete student account";
      console.error("Delete Error:", message);
      toast({
        title: t("error", "Error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      updateProcessing(userId, null);
    }
  };

  return (
    <div className="grid gap-4">
      {students.length === 0 ? (
        <p className="text-center py-8 text-gray-500">{t("no-students", "No students found")}</p>
      ) : (
        students.map((student) => {
          const isProcessing = !!processingIds[student.id];
          const isToggling = processingIds[student.id] === "toggle";
          const isDeleting = processingIds[student.id] === "delete";

          return (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{student.display_name || student.username} ({student.username})</span>
                  <Badge className={student.is_active ? "bg-green-500" : "bg-red-500"}>
                    {student.is_active ? t("active", "Active") : t("frozen", "Frozen")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{t("teacher-id", "Teacher ID")}</p>
                    <p>{student.teacher_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("created", "Created")}</p>
                    <p>{new Date(student.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("last-login", "Last Login")}</p>
                    <p>{student.last_login ? new Date(student.last_login).toLocaleString() : t("never", "Never")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("time-spent", "Time Spent")}</p>
                    <p>{student.time_spent || 0} {t("minutes", "minutes")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleAccount(student.id)}
                    variant={student.is_active ? "destructive" : "default"}
                    disabled={isProcessing}
                    aria-label={student.is_active ? "Freeze Account" : "Unfreeze Account"}
                  >
                    {isToggling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("processing", "Processing...")}
                      </>
                    ) : (
                      student.is_active ? t("freeze-account", "Freeze Account") : t("unfreeze-account", "Unfreeze Account")
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDeleteAccount(student.id)}
                    variant="outline"
                    className="text-red-500 border-red-500 hover:bg-red-50"
                    disabled={isProcessing}
                    aria-label="Delete Student Account"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("processing", "Processing...")}
                      </>
                    ) : (
                      t("delete-account", "Delete Account")
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default StudentsTab;
