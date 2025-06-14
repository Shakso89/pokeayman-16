
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import StudentForm from "./student/StudentForm";
import { createStudent } from "./student/studentService";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string | null;
  teacherData: any;
  onTeacherDataUpdate: (newData: any) => void;
}

interface School {
  id: string;
  name: string;
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
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load schools when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    setIsLoadingSchools(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading schools:', error);
        // Fallback to localStorage
        const savedSchools = localStorage.getItem("schools");
        if (savedSchools) {
          const parsedSchools = JSON.parse(savedSchools);
          setSchools(parsedSchools);
        }
      } else {
        setSchools(data || []);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
      toast({
        title: "Warning",
        description: "Could not load schools list",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const handleAddStudent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!studentData.username || !studentData.password || !studentData.displayName) {
        setError(t("fill-all-fields") || "Please fill all required fields");
        setIsLoading(false);
        return;
      }

      if (!studentData.schoolId) {
        setError("Please select a school for the student");
        setIsLoading(false);
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
          schools={schools}
          isLoadingSchools={isLoadingSchools}
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
