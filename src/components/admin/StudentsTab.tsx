
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [processingIds, setProcessingIds] = useState<Record<string, 'toggle' | 'delete'>>({});

  const handleToggleAccount = async (userId: string) => {
    try {
      // Set processing state
      setProcessingIds(prev => ({ ...prev, [userId]: 'toggle' }));
      
      // Find the current student in state
      const student = students.find(s => s.id === userId);
      if (!student) {
        throw new Error("Student not found");
      }
      
      const newIsActive = !student.is_active;
      
      // Update in Supabase
      const { error } = await supabase
        .from('students')
        .update({ is_active: newIsActive } as Partial<Student>)
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      const updatedStudents = students.map(student => {
        if (student.id === userId) {
          return {
            ...student,
            is_active: newIsActive
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      
      toast({
        title: "Student account updated",
        description: `Student account has been ${newIsActive ? "activated" : "frozen"}`
      });
    } catch (error: any) {
      console.error("Error toggling student account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student account",
        variant: "destructive"
      });
    } finally {
      // Clear processing state
      setProcessingIds(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    try {
      // Confirm deletion
      if (!window.confirm(t("confirm-delete-student") || "Are you sure you want to delete this student account? This action cannot be undone.")) {
        return;
      }
      
      // Set processing state
      setProcessingIds(prev => ({ ...prev, [userId]: 'delete' }));
      
      // Delete from Supabase
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      const filteredStudents = students.filter(student => student.id !== userId);
      setStudents(filteredStudents);
      
      toast({
        title: "Student account deleted",
        description: "Student account has been permanently deleted"
      });
    } catch (error: any) {
      console.error("Error deleting student account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete student account",
        variant: "destructive"
      });
    } finally {
      // Clear processing state
      setProcessingIds(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }
  };

  return (
    <div className="grid gap-4">
      {students.map(student => (
        <Card key={student.id}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>{student.display_name || student.username} ({student.username})</span>
              <Badge className={student.is_active ? "bg-green-500" : "bg-red-500"}>
                {student.is_active ? t("active") || "Active" : t("frozen") || "Frozen"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{t("teacher-id") || "Teacher ID"}</p>
                <p>{student.teacher_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("created") || "Created"}</p>
                <p>{new Date(student.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("last-login") || "Last Login"}</p>
                <p>{student.last_login ? new Date(student.last_login).toLocaleString() : "Never"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("time-spent") || "Time Spent"}</p>
                <p>{student.time_spent || 0} {t("minutes") || "minutes"}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleToggleAccount(student.id)} 
                variant={student.is_active ? "destructive" : "default"}
                disabled={!!processingIds[student.id]}
              >
                {processingIds[student.id] === 'toggle' ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {t("processing") || "Processing..."}</>
                ) : (
                  student.is_active ? t("freeze-account") || "Freeze Account" : t("unfreeze-account") || "Unfreeze Account"
                )}
              </Button>
              <Button 
                onClick={() => handleDeleteAccount(student.id)} 
                variant="outline" 
                className="text-red-500 border-red-500 hover:bg-red-50"
                disabled={!!processingIds[student.id]}
              >
                {processingIds[student.id] === 'delete' ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {t("processing") || "Processing..."}</>
                ) : (
                  t("delete-account") || "Delete Account"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentsTab;
