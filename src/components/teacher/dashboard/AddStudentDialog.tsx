
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import StudentForm from "./student/StudentForm";
import { createStudent } from "./student/studentService";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    schoolId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStudent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!studentData.username || !studentData.password || !studentData.displayName) {
        setError(t("fill-all-fields") || "Please fill all required fields");
        return;
      }
      
      const createResponse = await createStudent(studentData, teacherId, t);
      
      // Show success message
      toast({
        title: "Success",
        description: t("student-added") || "Student added successfully"
      });
      
      // Reset form and close dialog
      setStudentData({
        username: "",
        password: "",
        displayName: "",
        schoolId: ""
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
      setError(error.message || "Failed to create student");
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setStudentData({
      username: "",
      password: "",
      displayName: "",
      schoolId: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create-student") || "Create Student"}</DialogTitle>
          <DialogDescription>
            {t("create-student-desc") || "Create a new student account linked to your teacher profile"}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <StudentForm 
          studentData={studentData}
          setStudentData={setStudentData}
          isLoading={isLoading}
          teacherId={teacherId}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleAddStudent} disabled={isLoading}>
            {isLoading ? `${t("creating") || "Creating"}...` : (t("create-account") || "Create Account")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
