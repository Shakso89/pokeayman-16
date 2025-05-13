
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import StudentForm from "./student/StudentForm";
import { createStudent } from "./student/studentService";

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
    setIsLoading(true);
    
    try {
      const createResponse = await createStudent(studentData, teacherId, t);
      
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
      
      if (createResponse.student) {
        updatedTeacherData.students.push(createResponse.student.id);
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
        
        <StudentForm 
          studentData={studentData}
          setStudentData={setStudentData}
          isLoading={isLoading}
        />
        
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
