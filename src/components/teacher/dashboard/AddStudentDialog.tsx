
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

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

  const handleAddStudent = () => {
    // Validate student data
    if (!studentData.username || !studentData.password || !studentData.displayName) {
      toast({
        title: "Error",
        description: t("fill-all-fields")
      });
      return;
    }
    
    // Create student ID
    const studentId = "student-" + Date.now().toString();
    
    // Get all students
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Check if username is already taken
    if (students.some((s: any) => s.username === studentData.username)) {
      toast({
        title: "Error",
        description: "This username is already in use"
      });
      return;
    }
    
    // Create new student
    const newStudent = {
      id: studentId,
      username: studentData.username,
      password: studentData.password,
      displayName: studentData.displayName,
      teacherId: teacherId,
      createdAt: new Date().toISOString(),
      pokemon: []
    };
    
    // Add to students array
    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));
    
    // Add student to teacher's student list
    if (teacherData) {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacherIndex = teachers.findIndex((t: any) => t.id === teacherId);
      
      if (teacherIndex !== -1) {
        if (!teachers[teacherIndex].students) {
          teachers[teacherIndex].students = [];
        }
        
        teachers[teacherIndex].students.push(studentId);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // Update local teacher data
        const updatedTeacherData = {
          ...teacherData,
          students: [...(teacherData.students || []), studentId]
        };
        onTeacherDataUpdate(updatedTeacherData);
      }
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
    onClose();
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentDisplayName">{t("display-name")}</Label>
            <Input
              id="studentDisplayName"
              value={studentData.displayName}
              onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
              placeholder={t("student-display-name")}
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
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddStudent}>
            {t("create-account")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
