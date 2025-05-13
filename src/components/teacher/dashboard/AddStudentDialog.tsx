
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/utils/creditService";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string | null;
  teacherData: any;
  onTeacherDataUpdate: (newData: any) => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  isOpen,
  onClose,
  teacherId,
  teacherData,
  onTeacherDataUpdate
}) => {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState({
    username: "",
    password: "",
    displayName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStudent = async () => {
    // Validate student data
    if (!studentData.username || !studentData.password || !studentData.displayName) {
      toast({
        title: "Error",
        description: t("fill-all-fields"),
        variant: "destructive"
      });
      return;
    }
    
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First check if username is already in use
      const { data: existingStudents, error: checkError } = await supabase
        .from('students')
        .select('username')
        .eq('username', studentData.username)
        .limit(1);
        
      if (checkError) {
        throw new Error(`Error checking username: ${checkError.message}`);
      }
        
      if (existingStudents && existingStudents.length > 0) {
        toast({
          title: "Error",
          description: "This username is already in use",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create new student in the database
      // The credit deduction is handled automatically by the database trigger
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          username: studentData.username,
          password: studentData.password, 
          display_name: studentData.displayName,
          teacher_id: teacherId
        })
        .select()
        .single();
        
      if (insertError) {
        // If there's an error from Supabase (like insufficient credits)
        if (insertError.message.includes("insufficient")) {
          toast({
            title: "Error",
            description: "Insufficient credits to create a student account",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to create student: ${insertError.message}`,
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return;
      }
      
      // Show success message
      toast({
        title: "Success",
        description: t("student-added")
      });
      
      // Reset form and close dialog
      setStudentData({
        username: "",
        password: "",
        displayName: "",
      });
      
      // Update local state
      const updatedTeacherData = { 
        ...teacherData 
      };
      
      if (!updatedTeacherData.students) {
        updatedTeacherData.students = [];
      }
      
      if (newStudent) {
        updatedTeacherData.students.push(newStudent.id);
        onTeacherDataUpdate(updatedTeacherData);
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create-student")}</DialogTitle>
          <DialogDescription>
            {t("create-student-desc")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="studentUsername">{t("username")}</Label>
            <Input
              id="studentUsername"
              value={studentData.username}
              onChange={(e) => setStudentData({...studentData, username: e.target.value})}
              placeholder={t("student-username")}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentDisplayName">{t("display-name")}</Label>
            <Input
              id="studentDisplayName"
              value={studentData.displayName}
              onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
              placeholder={t("student-display-name")}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentPassword">{t("password")}</Label>
            <Input
              id="studentPassword"
              type="password"
              value={studentData.password}
              onChange={(e) => setStudentData({...studentData, password: e.target.value})}
              placeholder={t("create-password")}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddStudent} disabled={isLoading}>
            {isLoading ? `${t("creating")}...` : t("create-account")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
